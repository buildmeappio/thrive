"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import prisma from "@/lib/db";
import { sendMail } from "@/lib/email";
import { signAccountToken, signContractToken } from "@/lib/jwt";
import { Roles } from "@/domains/auth/constants/roles";
import logger from "@/utils/logger";
import {
  generateExaminerContractSentEmail,
  EXAMINER_CONTRACT_SENT_SUBJECT,
} from "@/emails/examiner-status-updates";
import { ExaminerStatus } from "@prisma/client";
import { ActionResult } from "../types/contract.types";
import { generateAndUploadContractHtml } from "../server/contract.service";

export const sendContractAction = async (
  contractId: string,
): Promise<ActionResult<{ success: boolean }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get contract with relations
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        examinerProfile: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
        application: true,
        template: true,
        templateVersion: true,
      },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    // Generate contract HTML and upload to S3
    try {
      await generateAndUploadContractHtml(contractId);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate contract HTML. Please try previewing the contract first.",
      };
    }

    // Get examiner email
    let examinerEmail: string;
    let firstName: string;
    let lastName: string;
    let userId: string;
    let accountId: string;

    if (contract.examinerProfile?.account?.user) {
      const user = contract.examinerProfile.account.user;
      examinerEmail = user.email;
      firstName = user.firstName;
      lastName = user.lastName;
      userId = user.id;
      accountId = contract.examinerProfile.accountId;
    } else if (contract.application) {
      examinerEmail = contract.application.email;
      firstName = contract.application.firstName || "";
      lastName = contract.application.lastName || "";
      userId = "";
      accountId = "";
    } else {
      return { success: false, error: "Examiner email not found" };
    }

    // Generate JWT token for contract signing
    const token = contract.examinerProfile
      ? signAccountToken({
          email: examinerEmail,
          id: userId,
          accountId: accountId,
          role: Roles.MEDICAL_EXAMINER,
        })
      : signContractToken({
          contractId: contract.id,
          applicationId: contract.applicationId || undefined,
        });

    // Create contract signing link
    const contractSigningLink = `${process.env.NEXT_PUBLIC_APP_URL}/examiner/contract/${contractId}?token=${token}`;

    // Send email with contract signing button
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

    // Update contract status to SENT
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    // Update examiner profile status if applicable
    if (contract.examinerProfileId) {
      await prisma.examinerProfile.update({
        where: { id: contract.examinerProfileId },
        data: {
          status: ExaminerStatus.CONTRACT_SENT,
        },
      });
      revalidatePath(`/dashboard/examiner/${contract.examinerProfileId}`);
    }

    // Update application status if applicable
    if (contract.applicationId) {
      await prisma.examinerApplication.update({
        where: { id: contract.applicationId },
        data: {
          status: ExaminerStatus.CONTRACT_SENT,
        },
      });
      revalidatePath(
        `/dashboard/examiner/application/${contract.applicationId}`,
      );
    }

    // Create audit event
    await prisma.contractEvent.create({
      data: {
        contractId: contract.id,
        eventType: "SENT",
        actorRole: "admin",
        actorId: user.id,
        meta: {
          sentTo: examinerEmail,
        },
      },
    });

    logger.log(`✅ Contract sent successfully: ${contractId}`);

    revalidatePath("/dashboard/contracts");
    return { success: true, data: { success: true } };
  } catch (error) {
    logger.error("Error sending contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send contract",
    };
  }
};
