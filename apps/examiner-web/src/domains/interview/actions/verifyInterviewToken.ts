"use server";

import { verifyExaminerScheduleInterviewToken } from "@/lib/jwt";
import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { ExaminerStatus, InterviewSlotStatus } from "@prisma/client";

const ERROR_MESSAGES = {
  APPLICATION_NOT_FOUND: "Application not found",
  INVALID_TOKEN_FOR_APPLICATION: "Invalid token for this application",
  INTERVIEW_COMPLETED:
    "Interview rescheduling is no longer available. Your interview has already been completed.",
  CONTRACT_SENT:
    "Interview rescheduling is no longer available. A contract has been sent to you.",
  CONTRACT_SIGNED:
    "Interview rescheduling is no longer available. You have already signed the contract.",
  APPROVED:
    "Interview rescheduling is no longer available. Your application has been approved.",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
};

const BLOCKED_STATUSES_MESSAGES = {
  [ExaminerStatus.INTERVIEW_COMPLETED]: ERROR_MESSAGES.INTERVIEW_COMPLETED,
  [ExaminerStatus.CONTRACT_SENT]: ERROR_MESSAGES.CONTRACT_SENT,
  [ExaminerStatus.CONTRACT_SIGNED]: ERROR_MESSAGES.CONTRACT_SIGNED,
  [ExaminerStatus.APPROVED]: ERROR_MESSAGES.APPROVED,
};

type RequestedSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: InterviewSlotStatus;
};

type BookedSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
};

export type ApplicationData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  status: ExaminerStatus;
  alreadyBooked: boolean;
  bookedSlot?: BookedSlot;
  requestedSlots: RequestedSlot[];
};

const getApplicationById = async (applicationId: string) => {
  try {
    const application = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        interviewSlots: {
          where: { deletedAt: null },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            duration: true,
            status: true,
          },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!application) {
      throw HttpError.notFound(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.badRequest(error.message || "Failed to get application");
  }
};

export const verifyInterviewToken = async (token: string) => {
  try {
    const { applicationId } = verifyExaminerScheduleInterviewToken(token);

    const application = await getApplicationById(applicationId);

    const bookedSlot = application.interviewSlots.find(
      (slot) => slot.status === InterviewSlotStatus.BOOKED,
    );
    const requestedSlots = application.interviewSlots.filter(
      (slot) => slot.status === InterviewSlotStatus.REQUESTED,
    );

    // Prepare application data
    const applicationData: ApplicationData = {
      id: application.id,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      status: application.status,
      alreadyBooked: !!bookedSlot,
      bookedSlot: bookedSlot
        ? {
            id: bookedSlot.id,
            startTime: bookedSlot.startTime,
            endTime: bookedSlot.endTime,
          }
        : undefined,
      requestedSlots: requestedSlots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: slot.status,
      })),
    };

    // Check if application status blocks rescheduling
    const status = application.status;
    if (
      status in BLOCKED_STATUSES_MESSAGES &&
      Object.hasOwn(BLOCKED_STATUSES_MESSAGES, status)
    ) {
      const errorMessage =
        BLOCKED_STATUSES_MESSAGES[
          status as keyof typeof BLOCKED_STATUSES_MESSAGES
        ];
      return {
        success: true,
        application: applicationData,
        isBlocked: true,
        blockReason: status,
        errorMessage,
      };
    }

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
