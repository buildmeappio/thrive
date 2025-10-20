"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import { sendMail } from "@/lib/email";
import { signAccountToken } from "@/lib/jwt";
import { EXAMINER_APPROVED_SUBJECT, generateExaminerApprovedEmail } from "@/emails/examiner-approved";
import { ExaminerProfile, Account, User, Documents, ExaminerLanguage, Language } from "@prisma/client";
import { Roles } from "@/domains/auth/constants/roles";

interface ExaminerWithRelations extends ExaminerProfile {
  account: Account & {
    user: User;
  };
  medicalLicenseDocument: Documents | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
}

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

async function sendApprovalEmailToExaminer(examiner: ExaminerWithRelations) {
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

  const htmlTemplate = generateExaminerApprovedEmail({
    firstName,
    lastName,
    createAccountLink,
  });

  await sendMail({
    to: userEmail,
    subject: EXAMINER_APPROVED_SUBJECT,
    html: htmlTemplate,
  });
}


export default approveExaminer;

