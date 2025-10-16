"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import {
  generateExaminerRejectionEmail,
  EXAMINER_REJECTION_SUBJECT,
} from "../../../../templates/emails/examiner-rejection";

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

  const htmlContent = generateExaminerRejectionEmail({
    firstName,
    lastName,
    rejectionMessage,
  });

  await sendMail({
    to: userEmail,
    subject: EXAMINER_REJECTION_SUBJECT,
    html: htmlContent,
  });
}

export default rejectExaminer;

