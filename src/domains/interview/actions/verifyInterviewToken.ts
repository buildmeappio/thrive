"use server";

import { verifyExaminerScheduleInterviewToken } from "@/lib/jwt";
import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { ExaminerStatus } from "@prisma/client";

export const verifyInterviewToken = async (token: string) => {
  try {
    // Verify the JWT token
    const { email, applicationId } =
      verifyExaminerScheduleInterviewToken(token);

    // Fetch application details
    const application = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        interviewSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    // Verify email matches
    if (application.email !== email) {
      throw HttpError.unauthorized("Invalid token for this application");
    }

    // Prepare application data
    const applicationData = {
      id: application.id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      status: application.status,
      alreadyBooked: !!application.interviewSlot,
      bookedSlot: application.interviewSlot || undefined,
    };

    // Check if application status blocks rescheduling
    const status = application.status;
    if (
      status === ExaminerStatus.INTERVIEW_COMPLETED ||
      status === ExaminerStatus.CONTRACT_SENT ||
      status === ExaminerStatus.CONTRACT_SIGNED ||
      status === ExaminerStatus.APPROVED
    ) {
      let errorMessage = "Interview rescheduling is no longer available.";

      switch (status) {
        case ExaminerStatus.INTERVIEW_COMPLETED:
          errorMessage =
            "Interview rescheduling is no longer available. Your interview has already been completed.";
          break;
        case ExaminerStatus.CONTRACT_SENT:
          errorMessage =
            "Interview rescheduling is no longer available. A contract has been sent to you.";
          break;
        case ExaminerStatus.CONTRACT_SIGNED:
          errorMessage =
            "Interview rescheduling is no longer available. You have already signed the contract.";
          break;
        case ExaminerStatus.APPROVED:
          errorMessage =
            "Interview rescheduling is no longer available. Your application has been approved.";
          break;
      }

      return {
        success: true,
        application: applicationData,
        isBlocked: true,
        blockReason: status,
        errorMessage,
      };
    }

    // Normal flow - interview can be scheduled/rescheduled
    return {
      success: true,
      application: applicationData,
      isBlocked: false,
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.badRequest(error.message || "Invalid or expired token");
  }
};
