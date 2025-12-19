"use server";

import prisma from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";
import configurationService from "@/server/services/configuration.service";

/**
 * Get available time slots for a specific date
 * Returns time suggestions in 15-minute increments and existing booked slots
 */
export const getAvailableSlots = async (date: Date, applicationId?: string) => {
  try {
    // Get interview settings for working hours
    const interviewSettings = await configurationService.getInterviewSettings();

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Get all existing slots (booked and available) for this day
    const existingSlots = await prisma.interviewSlot.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lt: dayEnd,
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

    // Calculate working hours for the selected date in UTC
    // Convert UTC minutes to actual time for the selected date
    const startWorkingTime = new Date(dayStart);
    const startHours = Math.floor(interviewSettings.startWorkingHourUTC / 60);
    const startMins = interviewSettings.startWorkingHourUTC % 60;
    startWorkingTime.setUTCHours(startHours, startMins, 0, 0);

    const endWorkingTime = new Date(dayStart);
    const endHours = Math.floor(interviewSettings.endWorkingHourUTC / 60);
    const endMins = interviewSettings.endWorkingHourUTC % 60;
    endWorkingTime.setUTCHours(endHours, endMins, 0, 0);

    return {
      success: true,
      existingSlots: existingSlots.map((slot) => {
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
        ? existingSlots
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
