"use server";

import prisma from "@/lib/db";
import { verifyExaminerScheduleInterviewToken } from "@/lib/jwt";
import HttpError from "@/utils/httpError";
import { addMinutes, format } from "date-fns";
import emailService from "@/server/services/email.service";
import { ENV } from "@/constants/variables";

export type InterviewSlotRequestInput = {
  startTime: Date;
  durationMinutes: number;
};

export const requestInterviewSlots = async (
  token: string,
  requestedSlots: InterviewSlotRequestInput[],
) => {
  try {
    // Validate count
    if (!Array.isArray(requestedSlots)) {
      throw HttpError.badRequest("Requested slots must be an array");
    }
    if (requestedSlots.length < 2) {
      throw HttpError.badRequest("Please select at least 2 time slots");
    }
    if (requestedSlots.length > 5) {
      throw HttpError.badRequest("You can select up to 5 time slots");
    }

    // Validate durations
    for (const slot of requestedSlots) {
      if (
        !slot?.durationMinutes ||
        slot.durationMinutes < 15 ||
        slot.durationMinutes % 15 !== 0
      ) {
        throw HttpError.badRequest(
          "Slot duration must be at least 15 minutes and divisible by 15",
        );
      }
    }

    // Verify token
    const { email, applicationId } =
      verifyExaminerScheduleInterviewToken(token);

    const application = await prisma.examinerApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!application) {
      throw HttpError.notFound("Application not found");
    }
    if (application.email !== email) {
      throw HttpError.unauthorized("Invalid token for this application");
    }

    const normalized = requestedSlots.map(({ startTime, durationMinutes }) => {
      const endTime = addMinutes(startTime, durationMinutes);
      return { startTime, endTime, durationMinutes };
    });

    const created = await prisma.$transaction(async (tx) => {
      // Remove existing REQUESTED slots for this application
      await tx.interviewSlot.updateMany({
        where: {
          applicationId,
          status: "REQUESTED",
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          applicationId: null,
        },
      });

      // Ensure none of the requested slots conflict with BOOKED slots
      for (const { startTime, endTime } of normalized) {
        const conflictingSlots = await tx.interviewSlot.findMany({
          where: {
            deletedAt: null,
            status: "BOOKED",
            OR: [
              // New slot starts during existing slot
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              // New slot ends during existing slot
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
              // New slot completely contains existing slot
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { endTime: { lte: endTime } },
                ],
              },
              // Existing slot completely contains new slot
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gte: endTime } },
                ],
              },
            ],
          },
        });

        if (conflictingSlots.length > 0) {
          throw HttpError.badRequest(
            "One or more selected slots conflicts with an existing booking",
          );
        }
      }

      // Create new REQUESTED slots (duplicates allowed across applications)
      const createdSlots = await Promise.all(
        normalized.map(({ startTime, endTime, durationMinutes }) =>
          tx.interviewSlot.create({
            data: {
              startTime,
              endTime,
              duration: durationMinutes,
              status: "REQUESTED",
              applicationId,
            },
          }),
        ),
      );

      return createdSlots;
    });

    // Send admin email summarizing requested preferences (do not fail request if email fails)
    try {
      const adminEmail =
        ENV.ADMIN_NOTIFICATION_EMAIL || "admin@thrivenetwork.ca";
      const lines = created.map((slot) => {
        const date = format(slot.startTime, "EEEE, MMMM d, yyyy");
        const time = `${format(slot.startTime, "h:mm a")} - ${format(
          slot.endTime,
          "h:mm a",
        )}`;
        return `${date} • ${time} • ${slot.duration} min`;
      });

      const durationText =
        new Set(created.map((s) => s.duration)).size === 1
          ? String(created[0]?.duration ?? "")
          : "Varies";

      await emailService.sendEmail(
        `Interview Preferences Submitted - ${application.firstName ?? ""} ${application.lastName ?? ""}`,
        "admin-interview-scheduled.html",
        {
          message: "Interview preferences",
          action: "requested",
          firstName: application.firstName || "",
          lastName: application.lastName || "",
          email: application.email,
          interviewDate: "Multiple options",
          interviewTime: lines.join("<br/>"),
          duration: durationText,
        },
        adminEmail,
      );
    } catch (emailError) {
      console.error("Failed to send interview requested email:", emailError);
    }

    return {
      success: true,
      slots: created.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: slot.status,
      })),
    };
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    return {
      success: false,
      error: error.message || "Failed to request interview slots",
    };
  }
};
