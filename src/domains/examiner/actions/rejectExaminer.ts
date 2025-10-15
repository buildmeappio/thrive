"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";

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

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Rejected</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
      
      <p>Thank you for your interest in joining Thrive as a Medical Examiner. After careful review, we regret to inform you that your application has not been approved at this time.</p>
      
      <p><strong>Reason:</strong></p>
      <div style="background-color: #f9f9f9; border-left: 4px solid #C62828; padding: 15px; margin: 15px 0;">
        ${escapeHtml(rejectionMessage)}
      </div>
      
      <p>We appreciate your interest in working with Thrive and encourage you to reapply in the future if circumstances change.</p>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions or need assistance, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await sendMail({
    to: userEmail,
    subject: "Thrive Medical Examiner Application - Status Update",
    html: htmlContent,
  });
}

function escapeHtml(input: string) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default rejectExaminer;

