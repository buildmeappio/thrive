"use server";

import prisma from "@/lib/db";
import { addDays } from "date-fns";
import configurationService from "@/server/services/configuration.service";

/**
 * Get available time slots for a UTC time range (corresponding to a user's local calendar day)
 *
 * @param rangeStartUtc - UTC instant representing the start of the user's selected local day
 * @param rangeEndUtc - UTC instant representing the end of the user's selected local day (exclusive)
 * @param applicationId - Optional application ID to identify current user's requested slots
 *
 * Returns existing slots (booked and requested) within the UTC range.
 * The range should correspond to a complete local calendar day to ensure
 * all slots for that day are included, even if the local day spans two UTC dates.
 * Slots are filtered to only include those within configured working hours.
 */
export const getAvailableSlots = async (
  rangeStartUtc: Date,
  rangeEndUtc: Date,
  applicationId?: string,
) => {
  try {
    // Get interview settings for working hours validation
    const interviewSettings = await configurationService.getInterviewSettings();

    // Get all existing slots (booked and available) for this UTC range
    const existingSlots = await prisma.interviewSlot.findMany({
      where: {
        startTime: {
          gte: rangeStartUtc,
          lt: rangeEndUtc,
        },
        deletedAt: null,
      },
      include: {
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Filter slots to only include those within configured working hours
    const filteredSlots = existingSlots.filter((slot) => {
      const slotStartUtc = slot.startTime;
      const slotDateUtc = new Date(
        Date.UTC(
          slotStartUtc.getUTCFullYear(),
          slotStartUtc.getUTCMonth(),
          slotStartUtc.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      // Calculate working hours for the UTC day containing this slot
      const startHours = Math.floor(interviewSettings.startWorkingHourUTC / 60);
      const startMins = interviewSettings.startWorkingHourUTC % 60;
      const dayStartWorkingTime = new Date(slotDateUtc);
      dayStartWorkingTime.setUTCHours(startHours, startMins, 0, 0);

      const endHours = Math.floor(interviewSettings.endWorkingHourUTC / 60);
      const endMins = interviewSettings.endWorkingHourUTC % 60;
      const dayEndWorkingTime = new Date(slotDateUtc);
      dayEndWorkingTime.setUTCHours(endHours, endMins, 0, 0);

      // Check if slot falls within working hours
      return (
        slotStartUtc >= dayStartWorkingTime && slotStartUtc < dayEndWorkingTime
      );
    });

    return {
      success: true,
      existingSlots: filteredSlots.map((slot) => {
        const isBooked = slot.status === "BOOKED";
        const isRequested = slot.status === "REQUESTED";
        const isCurrentUserRequested =
          !!applicationId &&
          isRequested &&
          slot.applicationId === applicationId;

        return {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          status: slot.status,
          isBooked,
          isRequested,
          isCurrentUserRequested,
          bookedBy:
            isBooked && slot.application
              ? {
                  firstName: slot.application.firstName,
                  lastName: slot.application.lastName,
                  email: slot.application.email,
                }
              : null,
        };
      }),
      currentUserRequestedSlots: applicationId
        ? filteredSlots
            .filter(
              (slot) =>
                slot.status === "REQUESTED" &&
                slot.applicationId === applicationId,
            )
            .map((slot) => ({
              id: slot.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              duration: slot.duration,
              status: slot.status,
            }))
        : [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch available slots",
      existingSlots: [],
      currentUserRequestedSlots: [],
    };
  }
};

/**
 * Get slots for a specific month (for calendar view)
 */
export const getSlotsForMonth = async (year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = addDays(new Date(year, month + 1, 0), 1); // Last day of month + 1 day

  try {
    const slots = await prisma.interviewSlot.findMany({
      where: {
        startTime: {
          gte: startDate,
          lt: endDate,
        },
        deletedAt: null,
      },
      include: {
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return {
      success: true,
      slots: slots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        status: slot.status,
        isBooked: slot.status === "BOOKED",
        bookedBy: slot.application
          ? {
              firstName: slot.application.firstName,
              lastName: slot.application.lastName,
              email: slot.application.email,
            }
          : null,
      })),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch slots",
      slots: [],
    };
  }
};
