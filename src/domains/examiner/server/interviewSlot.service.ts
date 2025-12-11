'use server'; 
import prisma from "@/lib/db";
import { addMinutes, startOfDay, endOfDay } from "date-fns";

/**
 * Check if a time slot conflicts with existing slots
 */
export const checkSlotConflict = async (
  startTime: Date,
  endTime: Date,
  excludeSlotId?: string
): Promise<boolean> => {
  const conflictingSlots = await prisma.interviewSlot.findMany({
    where: {
      deletedAt: null,
      status: "BOOKED",
      OR: [
        // Slot starts during existing slot
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        // Slot ends during existing slot
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } },
          ],
        },
        // Slot completely contains existing slot
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
      ...(excludeSlotId && { id: { not: excludeSlotId } }),
    },
  });

  return conflictingSlots.length > 0;
};

/**
 * Create a dynamic interview slot
 * Validates duration (must be divisible by 15) and checks for conflicts
 */
export const createInterviewSlot = async (
  startTime: Date,
  durationMinutes: number,
  applicationId?: string
) => {
  // Validate duration (must be divisible by 15 and at least 15 minutes)
  if (durationMinutes < 15 || durationMinutes % 15 !== 0) {
    throw new Error("Slot duration must be at least 15 minutes and divisible by 15");
  }

  const endTime = addMinutes(startTime, durationMinutes);

  // Check for conflicts with existing booked slots
  const hasConflict = await checkSlotConflict(startTime, endTime);
  if (hasConflict) {
    throw new Error("Selected time slot conflicts with an existing booking");
  }

  // Check if slot already exists
  const existingSlot = await prisma.interviewSlot.findFirst({
    where: {
      startTime: startTime,
      endTime: endTime,
      deletedAt: null,
    },
  });

  if (existingSlot) {
    if (existingSlot.status === "BOOKED") {
      throw new Error("This time slot is already booked");
    }
    // If slot exists and is available, return it
    return existingSlot;
  }

  // Create new slot
  const slot = await prisma.interviewSlot.create({
    data: {
      startTime: startTime,
      endTime: endTime,
      duration: durationMinutes,
      status: applicationId ? "BOOKED" : "AVAILABLE",
      applicationId: applicationId || null,
    },
  });

  return slot;
};

/**
 * Get available time slots for a date
 * Returns 15-minute increment slots that are available for booking
 * Shows booked slots and suggests available time ranges
 */
export const getAvailableTimeSlots = async (
  date: Date,
  slotDurationMinutes: number = 30
) => {
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
    orderBy: {
      startTime: "asc",
    },
  });

  // Generate 15-minute increment suggestions
  const suggestions: Array<{
    startTime: Date;
    endTime: Date;
    duration: number;
    isAvailable: boolean;
    conflictReason?: string;
  }> = [];

  let currentTime = new Date(dayStart);
  const maxTime = new Date(dayEnd);
  maxTime.setHours(23, 45, 0, 0); // Last possible slot start time

  while (currentTime <= maxTime) {
    const slotEnd = addMinutes(currentTime, slotDurationMinutes);
    
    if (slotEnd > dayEnd) {
      break;
    }

    // Check if this time slot conflicts with any booked slots
    const hasConflict = await checkSlotConflict(currentTime, slotEnd);
    
    // Check if exact slot exists
    const exactSlot = existingSlots.find(
      (slot) =>
        slot.startTime.getTime() === currentTime.getTime() &&
        slot.endTime.getTime() === slotEnd.getTime()
    );

    suggestions.push({
      startTime: new Date(currentTime),
      endTime: new Date(slotEnd),
      duration: slotDurationMinutes,
      isAvailable: !hasConflict && (!exactSlot || exactSlot.status === "AVAILABLE"),
      conflictReason: hasConflict
        ? "Time conflicts with existing booking"
        : exactSlot?.status === "BOOKED"
        ? "Already booked"
        : undefined,
    });

    // Move to next 15-minute increment
    currentTime = addMinutes(currentTime, 15);
  }

  return {
    suggestions,
    existingSlots: existingSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      status: slot.status,
      applicationId: slot.applicationId,
    })),
  };
};

/**
 * Get all slots (available and booked) for a date range
 */
export const getAllSlotsForDateRange = async (
  startDate: Date,
  endDate: Date
) => {
  return prisma.interviewSlot.findMany({
    where: {
      startTime: {
        gte: startDate,
      },
      endTime: {
        lte: endDate,
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
};

/**
 * Book an interview slot (creates slot dynamically if it doesn't exist)
 */
export const bookInterviewSlot = async (
  startTime: Date,
  durationMinutes: number,
  applicationId: string
) => {
  // Validate duration
  if (durationMinutes < 15 || durationMinutes % 15 !== 0) {
    throw new Error("Slot duration must be at least 15 minutes and divisible by 15");
  }

  return prisma.$transaction(async (tx) => {
    // Check if application already has a booked slot
    const existingBooking = await tx.examinerApplication.findUnique({
      where: { id: applicationId },
      include: { interviewSlot: true },
    });

    if (existingBooking?.interviewSlot) {
      throw new Error("Application already has a booked interview slot");
    }

    const endTime = addMinutes(startTime, durationMinutes);

    // Check for conflicts
    const conflictingSlots = await tx.interviewSlot.findMany({
      where: {
        deletedAt: null,
        status: "BOOKED",
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
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
      throw new Error("Selected time slot conflicts with an existing booking");
    }

    // Check if exact slot exists
    const existingSlot = await tx.interviewSlot.findFirst({
      where: {
        startTime: startTime,
        endTime: endTime,
        deletedAt: null,
      },
    });

    if (existingSlot) {
      if (existingSlot.status === "BOOKED") {
        throw new Error("This time slot is already booked");
      }
      // Update existing available slot
      const updatedSlot = await tx.interviewSlot.update({
        where: { id: existingSlot.id },
        data: {
          status: "BOOKED" as const,
          applicationId: applicationId,
        },
      });
      return updatedSlot;
    }

    // Create new slot and book it
    const newSlot = await tx.interviewSlot.create({
      data: {
        startTime: startTime,
        endTime: endTime,
        duration: durationMinutes,
        status: "BOOKED" as const,
        applicationId: applicationId,
      },
    });

    return newSlot;
  });
};

const interviewSlotService = {
  checkSlotConflict,
  createInterviewSlot,
  getAvailableTimeSlots,
  getAllSlotsForDateRange,
  bookInterviewSlot,
};

export default interviewSlotService;

