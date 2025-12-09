"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import logger from "@/utils/logger";
import { checkEntityType } from "../utils/checkEntityType";

export type UpdateFeeStructureData = {
  IMEFee: number;
  recordReviewFee: number;
  hourlyRate?: number;
  cancellationFee: number;
  paymentTerms: string;
};

export async function updateFeeStructure(
  id: string,
  data: UpdateFeeStructureData
) {
  try {
    // Check if it's an application or examiner
    const entityType = await checkEntityType(id);

    if (entityType === 'application') {
      // Store fee structure in ExaminerApplication
      const application = await prisma.examinerApplication.update({
        where: { id },
        data: {
          IMEFee: data.IMEFee,
          recordReviewFee: data.recordReviewFee,
          hourlyRate: data.hourlyRate ?? null,
          cancellationFee: data.cancellationFee,
          paymentTerms: data.paymentTerms,
        },
      });

      // Revalidate the application detail page
      revalidatePath(`/examiner/application/${id}`);

      return {
        success: true,
        data: {
          IMEFee: application.IMEFee,
          recordReviewFee: application.recordReviewFee,
          hourlyRate: application.hourlyRate,
          cancellationFee: application.cancellationFee,
          paymentTerms: application.paymentTerms,
        },
      };
    } else if (entityType === 'examiner') {
      // Check if fee structure exists for this examiner
      const existingFeeStructure = await prisma.examinerFeeStructure.findFirst({
        where: {
          examinerProfileId: id,
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
            examinerProfileId: id,
            IMEFee: data.IMEFee,
            recordReviewFee: data.recordReviewFee,
            hourlyRate: data.hourlyRate ?? null,
            cancellationFee: data.cancellationFee,
            paymentTerms: data.paymentTerms,
          },
        });
      }

      // Revalidate the examiner detail page
      revalidatePath(`/examiner/${id}`);

      return {
        success: true,
        data: feeStructure,
      };
    } else {
      return {
        success: false,
        error: "Application or examiner not found",
      };
    }
  } catch (error) {
    logger.error("Error updating fee structure:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update fee structure",
    };
  }
}

