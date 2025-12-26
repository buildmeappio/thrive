"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import prisma from "@/lib/db";
import { ActionResult } from "../types/contract.types";
import logger from "@/utils/logger";
import { revalidatePath } from "next/cache";

export const updateContractReviewDateAction = async (
  contractId: string,
  reviewDate: Date | null,
): Promise<ActionResult<{ success: boolean }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Update contract review date
    await prisma.contract.update({
      where: { id: contractId },
      data: {
        reviewedAt: reviewDate,
      },
    });

    logger.log(
      `✅ Contract review date updated: ${contractId} - ${reviewDate?.toISOString() || "cleared"}`,
    );

    // Create audit event
    await prisma.contractEvent.create({
      data: {
        contractId,
        eventType: reviewDate ? "reviewed" : "review_cleared",
        actorRole: "admin",
        actorId: user.id,
        meta: {
          reviewedAt: reviewDate?.toISOString() || null,
        },
      },
    });

    revalidatePath("/dashboard/contracts");
    revalidatePath(`/dashboard/contracts/${contractId}`);

    return { success: true, data: { success: true } };
  } catch (error) {
    logger.error("Error updating contract review date:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update contract review date",
    };
  }
};
