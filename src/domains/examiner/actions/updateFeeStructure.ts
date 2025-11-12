"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type UpdateFeeStructureData = {
  IMEFee: number;
  recordReviewFee: number;
  hourlyRate?: number;
  cancellationFee: number;
  paymentTerms: string;
};

export async function updateFeeStructure(
  examinerProfileId: string,
  data: UpdateFeeStructureData
) {
  try {
    // Check if fee structure exists for this examiner
    const existingFeeStructure = await prisma.examinerFeeStructure.findFirst({
      where: {
        examinerProfileId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let feeStructure;

    if (existingFeeStructure) {
      // Update existing fee structure
      feeStructure = await prisma.examinerFeeStructure.update({
        where: {
          id: existingFeeStructure.id,
        },
        data: {
          IMEFee: data.IMEFee,
          recordReviewFee: data.recordReviewFee,
          hourlyRate: data.hourlyRate ?? null,
          cancellationFee: data.cancellationFee,
          paymentTerms: data.paymentTerms,
        },
      });
    } else {
      // Create new fee structure
      feeStructure = await prisma.examinerFeeStructure.create({
        data: {
          examinerProfileId,
          IMEFee: data.IMEFee,
          recordReviewFee: data.recordReviewFee,
          hourlyRate: data.hourlyRate ?? null,
          cancellationFee: data.cancellationFee,
          paymentTerms: data.paymentTerms,
        },
      });
    }

    // Revalidate the examiner detail page
    revalidatePath(`/examiner/${examinerProfileId}`);

    return {
      success: true,
      data: feeStructure,
    };
  } catch (error) {
    console.error("Error updating fee structure:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update fee structure",
    };
  }
}

