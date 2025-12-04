"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendMail } from "@/lib/email";
import { signAccountToken } from "@/lib/jwt";
import { Roles } from "@/domains/auth/constants/roles";
import { getCurrentUser } from "@/domains/auth/server/session";
import contractService from "../server/contract.service";
import { HttpError } from "@/utils/httpError";
import logger from "@/utils/logger";
import {
  generateExaminerContractSentEmail,
  EXAMINER_CONTRACT_SENT_SUBJECT,
} from "@/emails/examiner-status-updates";

export async function sendContract(examinerProfileId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw HttpError.unauthorized("You must be logged in to send contract");
    }

    // Get examiner details
    const examiner = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!examiner) {
      throw new Error("Examiner not found");
    }

    const firstName = examiner.account.user.firstName;
    const lastName = examiner.account.user.lastName;
    const examinerEmail = examiner.account.user.email;
    const userId = examiner.account.user.id;
    const accountId = examiner.accountId;

    // Create contract record using contract service (same as approve flow)
    logger.log("📄 Creating contract for examiner...");
    const contractResult = await contractService.createAndSendContract(
      examinerProfileId,
      user.accountId
    );

    if (!contractResult.success) {
      throw new Error(contractResult.error || "Failed to create contract");
    }

    logger.log("✅ Contract created successfully:", contractResult.contractId);

    // Generate JWT token for contract signing
    logger.log("🔐 Generating contract signing token...");
    const token = signAccountToken({
      email: examinerEmail,
      id: userId,
      accountId: accountId,
      role: Roles.MEDICAL_EXAMINER,
    });

    // Create contract signing link using CONTRACT ID (not examiner profile ID)
    const contractSigningLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/contract/${contractResult.contractId}?token=${token}`;

    // Send email with contract signing button
    logger.log("📧 Sending contract signing email...");

    const htmlTemplate = generateExaminerContractSentEmail({
      firstName,
      lastName,
      contractSigningLink,
    });

    await sendMail({
      to: examinerEmail,
      subject: EXAMINER_CONTRACT_SENT_SUBJECT,
      html: htmlTemplate,
    });

    logger.log(`✅ Contract signing email sent to ${examinerEmail}`);

    // Update examiner status to CONTRACT_SENT
    await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        status: "CONTRACT_SENT",
      },
    });

    // Revalidate the examiner page
    revalidatePath(`/examiner/${examinerProfileId}`);

    return {
      success: true,
      message: "Contract signing link sent successfully",
    };
  } catch (error) {
    logger.error("Error sending contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send contract",
    };
  }
}
