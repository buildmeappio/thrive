"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { signExaminerResubmitToken } from "@/lib/jwt";
import emailService from "@/services/email.service";
import { ENV } from "@/constants/variables";

const requestMoreInfo = async (examinerId: string, message: string, documentsRequired: boolean = false) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!message?.trim()) {
    throw new Error("Request message is required");
  }

  // Update examiner status to INFO_REQUESTED
  const examiner = await examinerService.requestMoreInfoFromExaminer(examinerId);

  // Send request for more info email
  try {
    await sendRequestMoreInfoEmail(examiner, message, documentsRequired);
    console.log("✓ Request more info email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send request email:", emailError);
    throw emailError;
  }

  // Revalidate dashboard and examiner pages
  revalidatePath("/dashboard");
  revalidatePath("/examiner");

  return examiner;
};

async function sendRequestMoreInfoEmail(examiner: any, requestMessage: string, documentsRequired: boolean = false) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;
  const userId = examiner.account?.user?.id;
  const accountId = examiner.accountId;
  const examinerId = examiner.id;

  if (!userEmail || !firstName || !lastName || !userId || !accountId || !examinerId) {
    console.error("Missing required user information for request email");
    throw new Error("Missing user information");
  }

  // Generate token with examiner's information for resubmission
  const token = signExaminerResubmitToken({
    email: userEmail,
    userId: userId,
    accountId: accountId,
    examinerId: examinerId,
  });

  const resubmitLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/register?token=${token}`;
  
  const result = await emailService.sendEmail(
    "Thrive Medical Examiner Application - Additional Information Required",
    "examiner-request-more-info.html",
    {
      firstName,
      lastName,
      requestMessage,
      resubmitLink,
      documentsRequired,
      CDN_URL: ENV.NEXT_PUBLIC_CDN_URL,
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default requestMoreInfo;

