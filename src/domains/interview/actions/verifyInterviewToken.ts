"use server";

import { verifyExaminerScheduleInterviewToken } from "@/lib/jwt";
import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";

export const verifyInterviewToken = async (token: string) => {
  try {
    // Verify the JWT token
    const { email, applicationId } = verifyExaminerScheduleInterviewToken(token);

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

    // Check if already booked
    if (application.interviewSlot) {
      return {
        success: true,
        application: {
          id: application.id,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          status: application.status,
          alreadyBooked: true,
          bookedSlot: application.interviewSlot,
        },
      };
    }

    return {
      success: true,
      application: {
        id: application.id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        status: application.status,
        alreadyBooked: false,
      },
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.badRequest(error.message || "Invalid or expired token");
  }
};

