"use server";

import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";
import logger from "@/utils/logger";
import { HttpError } from "@/utils/httpError";
import { ExaminerStatus } from "@prisma/client";

export const toggleExaminerStatus = async (
  id: string,
): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    // First, get the current examiner to check status
    const currentExaminer = await examinerService.getExaminerById(id);

    if (!currentExaminer) {
      return {
        success: false,
        error: "Examiner not found",
      };
    }

    const currentStatus = currentExaminer.status;

    // Toggle between ACTIVE and SUSPENDED
    let result;
    if (currentStatus === ExaminerStatus.ACTIVE) {
      // Suspend the examiner
      result = await examinerService.suspendExaminer(id);
    } else if (currentStatus === ExaminerStatus.SUSPENDED) {
      // Reactivate the examiner
      result = await examinerService.reactivateExaminer(id);
    } else {
      return {
        success: false,
        error: `Cannot toggle status. Current status is ${currentStatus}. Only ACTIVE and SUSPENDED examiners can be toggled.`,
      };
    }

    const examinerData = ExaminerDto.toExaminerData(result as any);

    return {
      success: true,
      data: examinerData,
    };
  } catch (error) {
    logger.error("Failed to toggle examiner status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle examiner status. Please try again.",
    };
  }
};

export default toggleExaminerStatus;

