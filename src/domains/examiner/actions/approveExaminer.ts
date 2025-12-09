"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import contractService from "../server/contract.service";
import { sendMail } from "@/lib/email";
import { signAccountToken } from "@/lib/jwt";
import {
  EXAMINER_APPROVED_SUBJECT,
  generateExaminerApprovedEmail,
} from "@/emails/examiner-approved";
import {
  ExaminerProfile,
  Account,
  User,
  Documents,
  ExaminerLanguage,
  Language,
} from "@prisma/client";
import { Roles } from "@/domains/auth/constants/roles";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";

interface ExaminerWithRelations extends ExaminerProfile {
  account: Account & {
    user: User;
  };
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
}

const approveExaminer = async (examinerId: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized(
      "You must be logged in to approve an examiner"
    );
  }

  // Approve the examiner
  const examiner = await examinerService.approveExaminer(
    examinerId,
    user.accountId
  );

  // Generate and upload contract to S3 (don't fail approval if this fails)
  try {
    logger.log("📄 Generating contract for examiner...");
    const contractResult = await contractService.createAndSendContract(
      examinerId,
      user.accountId
    );

    if (contractResult.success) {
      logger.log("✅ Contract generated and uploaded successfully:", contractResult.contractId);
    } else {
      logger.error("⚠️ Failed to generate contract (but approval succeeded):", contractResult.error);
    }
  } catch (contractError) {
    logger.error("⚠️ Failed to generate contract (but approval succeeded):", contractError);
  }

  // Send approval email with token (don't fail approval if email fails)
  try {
    await sendApprovalEmailToExaminer(examiner as any);
    logger.log("✓ Approval email sent successfully");
  } catch (emailError) {
    logger.error(
      "⚠️ Failed to send approval email (but approval succeeded):",
      emailError
    );
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
    logger.error("Missing required user information for email");
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
