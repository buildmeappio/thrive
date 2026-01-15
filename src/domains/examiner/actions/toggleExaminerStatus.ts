"use server";

import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";
import logger from "@/utils/logger";
import { ExaminerStatus, UserStatus, Prisma } from "@prisma/client";

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

    // Check ExaminerProfile.status (workflow) or User.status (account status)
    // Priority: ExaminerProfile.status first, then User.status
    const profileStatus = currentExaminer.status;
    const userStatus = currentExaminer.account.user.status;

    // Toggle between ACTIVE and SUSPENDED
    let result;
    if (
      profileStatus === ExaminerStatus.ACTIVE ||
      userStatus === UserStatus.ACTIVE
    ) {
      // Suspend the examiner
      result = await examinerService.suspendExaminer(id);
    } else if (
      profileStatus === ExaminerStatus.SUSPENDED ||
      userStatus === UserStatus.SUSPENDED
    ) {
      // Reactivate the examiner
      result = await examinerService.reactivateExaminer(id);
    } else {
      return {
        success: false,
        error: `Cannot toggle status. Current status is ${profileStatus || userStatus}. Only ACTIVE and SUSPENDED examiners can be toggled.`,
      };
    }

    const examinerData = await ExaminerDto.toExaminerData(result as any);

    return {
      success: true,
      data: examinerData,
    };
  } catch (error) {
    logger.error("Failed to toggle examiner status:", error);

    // Handle Prisma errors with meaningful messages
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return {
            success: false,
            error: "Examiner not found. Please refresh the page and try again.",
          };
        case "P2003":
          return {
            success: false,
            error:
              "Unable to update examiner status due to a data constraint. Please contact support if this issue persists.",
          };
        default:
          return {
            success: false,
            error:
              "A database error occurred while updating the examiner status. Please try again or contact support if the problem persists.",
          };
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return {
        success: false,
        error: "Invalid data provided. Please refresh the page and try again.",
      };
    }

    // Handle other errors
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message.includes("prisma") ||
            error.message.includes("database")
            ? "A database error occurred. Please try again or contact support if the problem persists."
            : error.message
          : "Failed to toggle examiner status. Please try again.",
    };
  }
};

export default toggleExaminerStatus;
