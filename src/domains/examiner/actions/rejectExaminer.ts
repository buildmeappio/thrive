"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import emailService from "@/services/email.service";
import { ENV } from "@/constants/variables";

const rejectExaminer = async (examinerId: string, messageToExaminer: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!messageToExaminer?.trim()) {
    throw new Error("Rejection message is required");
  }

  // Reject the examiner
  const examiner = await examinerService.rejectExaminer(
    examinerId,
    user.accountId,
    messageToExaminer.trim()
  );

  // Send rejection email
  try {
    await sendRejectionEmailToExaminer(examiner, messageToExaminer);
    console.log("✓ Rejection email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send rejection email (but rejection succeeded):", emailError);
  }

  // Revalidate dashboard and examiner pages
  revalidatePath("/dashboard");
  revalidatePath("/examiner");

  return examiner;
};

async function sendRejectionEmailToExaminer(examiner: any, rejectionMessage: string) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;

  if (!userEmail || !firstName || !lastName) {
    console.error("Missing required user information for rejection email");
    return;
  }

  const result = await emailService.sendEmail(
    "Thrive Medical Examiner Application - Status Update",
    "examiner-rejection.html",
    {
      firstName,
      lastName,
      rejectionMessage,
      CDN_URL: ENV.NEXT_PUBLIC_CDN_URL,
    },
    userEmail
  );

  if (!result.success) {
    throw new Error((result as { success: false; error: string }).error);
  }
}

export default rejectExaminer;

