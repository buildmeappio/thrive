"use server";

import prisma from "@/lib/db";
import { startOfDay, endOfDay, addDays, addMinutes } from "date-fns";
import configurationService from "@/server/services/configuration.service";

/**
 * Get available time slots for a specific date
 * Returns time suggestions in 15-minute increments and existing booked slots
 */
export const getAvailableSlots = async (date: Date) => {
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

    // Generate time suggestions in 15-minute increments within working hours
    const timeSuggestions: Array<{
      startTime: Date;
      isAvailable: boolean;
      conflictReason?: string;
    }> = [];

    let currentTime = new Date(startWorkingTime);
    // Last possible slot start time (end time - 15 minutes to allow for minimum slot)
    const maxTime = new Date(endWorkingTime);
    maxTime.setMinutes(maxTime.getMinutes() - 15);

    while (currentTime <= maxTime) {
      // Check if this time conflicts with any booked slots
      const conflicts = existingSlots.filter((slot) => {
        if (slot.status !== "BOOKED") return false;
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        // Check if current time falls within any booked slot
        return currentTime >= slotStart && currentTime < slotEnd;
      });

      timeSuggestions.push({
        startTime: new Date(currentTime),
        isAvailable: conflicts.length === 0,
        conflictReason:
          conflicts.length > 0
            ? "Time conflicts with existing booking"
            : undefined,
      });

      // Move to next 15-minute increment
      currentTime = addMinutes(currentTime, 15);
    }

    return {
      success: true,
      timeSuggestions,
      existingSlots: existingSlots.map((slot) => ({
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
      error: error.message || "Failed to fetch available slots",
      timeSuggestions: [],
      existingSlots: [],
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
