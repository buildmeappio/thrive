"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { signAccountToken } from "@/lib/jwt";
import { Roles } from "@/domains/auth/constants/roles";
import fs from "fs";
import path from "path";

const approveExaminer = async (examinerId: string) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Approve the examiner
  const examiner = await examinerService.approveExaminer(examinerId, user.accountId);

  // Send approval email with token (don't fail approval if email fails)
  try {
    await sendApprovalEmailToExaminer(examiner);
    console.log("✓ Approval email sent successfully");
  } catch (emailError) {
    console.error("⚠️ Failed to send approval email (but approval succeeded):", emailError);
  }

  return examiner;
};

async function sendApprovalEmailToExaminer(examiner: any) {
  const userEmail = examiner.account?.user?.email;
  const firstName = examiner.account?.user?.firstName;
  const lastName = examiner.account?.user?.lastName;
  const userId = examiner.account?.user?.id;
  const accountId = examiner.accountId;

  if (!userEmail || !firstName || !lastName || !userId) {
    console.error("Missing required user information for email");
    return;
  }

  // Generate token with email, user id, account id, and role
  const token = signAccountToken({
    email: userEmail,
    id: userId,
    accountId: accountId,
    role: Roles.MEDICAL_EXAMINER,
  });

  const createAccountLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/create-account?token=${token}`;

  // Read the HTML template
  const templatePath = path.join(process.cwd(), "src/lib/email-templates/examiner-approved.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  // Replace placeholders with actual data
  htmlTemplate = htmlTemplate
    .replace(/\{\{firstName\}\}/g, escapeHtml(firstName))
    .replace(/\{\{lastName\}\}/g, escapeHtml(lastName))
    .replace(/\{\{createAccountLink\}\}/g, createAccountLink);

  await sendMail({
    to: userEmail,
    subject: "Your Thrive Medical Examiner Profile Has Been Approved",
    html: htmlTemplate,
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

export default approveExaminer;

