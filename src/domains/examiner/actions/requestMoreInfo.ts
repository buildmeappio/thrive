"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";

const requestMoreInfo = async (examinerId: string, message: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!message?.trim()) {
    throw new Error("Request message is required");
  }

  // Update examiner status or add note (you can modify this based on your needs)
  const examiner = await examinerService.getExaminerById(examinerId);

  // Send request for more info email
  try {
    await sendRequestMoreInfoEmail(examiner, message);
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

async function sendRequestMoreInfoEmail(examiner: any, requestMessage: string) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;

  if (!userEmail || !firstName || !lastName) {
    console.error("Missing required user information for request email");
    throw new Error("Missing user information");
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Additional Information Required</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <div style="text-align: center;">
      <img src="https://public-thrive-assets.s3.eu-north-1.amazonaws.com/thriveLogo.png" alt="Thrive Logo" style="width: 120px;">
    </div>
    
    <div style="margin-top: 20px; font-size: 16px; color: #333333;">
      <p>Hi Dr. ${escapeHtml(firstName)} ${escapeHtml(lastName)},</p>
      
      <p>Thank you for submitting your application to become a Medical Examiner with Thrive.</p>
      
      <p>We're currently reviewing your profile and need some additional information to complete our assessment:</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #00A8FF; padding: 15px; margin: 15px 0;">
        ${escapeHtml(requestMessage)}
      </div>
      
      <p>Please reply to this email with the requested information at your earliest convenience so we can continue processing your application.</p>
    </div>
    
    <div style="margin-top: 30px; font-size: 14px; color: #777777; text-align: center;">
      <p>If you have any questions, feel free to contact us at 
        <a href="mailto:support@thrivenetwork.ca" style="color: #00A8FF;">support@thrivenetwork.ca</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  await sendMail({
    to: userEmail,
    subject: "Thrive Medical Examiner Application - Additional Information Required",
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

export default requestMoreInfo;

