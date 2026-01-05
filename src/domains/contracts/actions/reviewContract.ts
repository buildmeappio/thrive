"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import prisma from "@/lib/db";
import { ActionResult } from "../types/contract.types";
import logger from "@/utils/logger";
import { revalidatePath } from "next/cache";

export interface ReviewContractInput {
  contractId: string;
  signatureImage: string | null; // Signature image as data URL (optional)
  reviewDate: string; // Date string in YYYY-MM-DD format
}

export const reviewContractAction = async (
  input: ReviewContractInput,
): Promise<ActionResult<{ success: boolean }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.contractId) {
      return { success: false, error: "Contract ID is required" };
    }

    if (!input.reviewDate) {
      return { success: false, error: "Review date is required" };
    }

    // Get the contract
    const contract = await prisma.contract.findUnique({
      where: { id: input.contractId },
    });

    if (!contract) {
      return { success: false, error: "Contract not found" };
    }

    if (contract.status !== "SIGNED") {
      return {
        success: false,
        error: `Contract cannot be reviewed. Current status: ${contract.status}`,
      };
    }

    // Parse review date - create date at midnight UTC
    const reviewDate = new Date(input.reviewDate + "T00:00:00.000Z");

    // Get existing fieldValues
    const existingFieldValues = (contract.fieldValues as any) || {};

    // Update fieldValues with admin signature (if provided) and review date
    const updatedFieldValues = {
      ...existingFieldValues,
      custom: {
        ...(existingFieldValues.custom || {}),
        ...(input.signatureImage
          ? { admin_signature: input.signatureImage }
          : {}),
      },
      contract: {
        ...(existingFieldValues.contract || {}),
        review_date: input.reviewDate, // Store as YYYY-MM-DD string
      },
    };

    // Update contract
    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        reviewedAt: reviewDate,
        fieldValues: updatedFieldValues,
      },
    });

    logger.log(
      `✅ Contract reviewed by admin: ${input.contractId} - Review date: ${reviewDate.toISOString()}`,
    );

    // Create audit event
    await prisma.contractEvent.create({
      data: {
        contractId: contract.id,
        eventType: "reviewed",
        actorRole: "admin",
        actorId: user.id,
        meta: {
          reviewedAt: reviewDate.toISOString(),
          hasAdminSignature: !!input.signatureImage,
        },
      },
    });

    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${input.contractId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    logger.error("Error reviewing contract:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to review contract",
    };
  }
};
