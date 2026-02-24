"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import examinerService from "../server/examiner.service";
import applicationService from "../server/application.service";
import prisma from "@/lib/db";
import { sendMail } from "@/lib/email";
import { signAccountToken, signExaminerApplicationToken } from "@/lib/jwt";
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
  ExaminerApplication,
  Address,
} from "@thrive/database";
import { Roles } from "@/domains/auth/constants/roles";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import { checkEntityType } from "../utils/checkEntityType";

interface ExaminerWithRelations extends ExaminerProfile {
  account: Account & {
    user: User;
  };
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
}

interface ApplicationWithRelations extends ExaminerApplication {
  address: Address | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  redactedIMEReportDocument: Documents | null;
}

const approveExaminer = async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    throw HttpError.unauthorized("You must be logged in to approve");
  }

  // Check if it's an application or examiner
  const entityType = await checkEntityType(id);

  if (entityType === "application") {
    // Approve the application
    const application = await applicationService.approveApplication(
      id,
      user.accountId,
    );

    // Send approval email with application token (don't fail approval if email fails)
    try {
      await sendApprovalEmailToApplicant(application as any);
      logger.log("✓ Approval email sent successfully");
    } catch (emailError) {
      logger.error(
        "⚠️ Failed to send approval email (but approval succeeded):",
        emailError,
      );
    }

    return application;
  } else if (entityType === "examiner") {
    // Approve the examiner
    // Note: Contract should already be created and sent via the contract creation modal
    // before approval is called. We no longer auto-create contracts here.
    const examiner = await examinerService.approveExaminer(id, user.accountId);

    // Check if contract was already created and sent
    const existingContract = await prisma.contract.findFirst({
      where: {
        examinerProfileId: id,
        status: { in: ["SENT", "SIGNED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!existingContract) {
      logger.warn(
        "⚠️ No contract found for examiner. Contract should be created and sent before approval.",
      );
    } else {
      logger.log(
        "✅ Contract already exists for examiner:",
        existingContract.id,
      );
    }

    // Don't send approval email if contract was already sent
    // The contract email with signing link was already sent, so we don't need the approval email
    if (!existingContract || existingContract.status !== "SENT") {
      // Only send approval email if no contract was sent yet
      try {
        await sendApprovalEmailToExaminer(examiner as any);
        logger.log("✓ Approval email sent successfully");
      } catch (emailError) {
        logger.error(
          "⚠️ Failed to send approval email (but approval succeeded):",
          emailError,
        );
      }
    } else {
      logger.log("✓ Contract email already sent, skipping approval email");
    }

    return examiner;
  } else {
    throw HttpError.notFound("Application or examiner not found");
  }
};

async function sendApprovalEmailToApplicant(
  application: ApplicationWithRelations,
) {
  const userEmail = application.email;
  const firstName = application.firstName;
  const lastName = application.lastName;

  if (!userEmail || !firstName || !lastName) {
    logger.error("Missing required application information for email");
    return;
  }

  // Generate token with email and application ID (no account yet)
  const token = signExaminerApplicationToken({
    email: userEmail,
    applicationId: application.id,
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
