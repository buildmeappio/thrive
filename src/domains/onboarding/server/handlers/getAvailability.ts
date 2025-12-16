import { availabilityService } from "@/domains/setting/server/services/availability.service";
import HttpError from "@/utils/httpError";

export type GetAvailabilityInput = {
  examinerProfileId: string;
};

type WeeklyHoursWithTimeSlots = {
  id: string;
  availabilityProviderId: string;
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  timeSlots: {
    id: string;
    weeklyHourId: string;
    startTime: string;
    endTime: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }[];
};

type OverrideHoursWithTimeSlots = {
  id: string;
  availabilityProviderId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  timeSlots: {
    id: string;
    overrideHourId: string;
    startTime: string;
    endTime: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }[];
};

const getAvailability = async (payload: GetAvailabilityInput) => {
  try {
    const prisma = (await import("@/lib/db")).default;
    const [availability, examinerProfile] = await Promise.all([
      availabilityService.getCompleteAvailability(payload.examinerProfileId),
      prisma.examinerProfile.findUnique({
        where: { id: payload.examinerProfileId },
        select: {
          minimumNoticeValue: true,
          maxIMEsPerWeek: true,
        },
      }),
    ]);

    // Initialize with default values for all days (using lowercase keys for form compatibility)
    const defaultTimeSlot = [{ startTime: "8:00 AM", endTime: "11:00 AM" }];
    const weeklyHoursObject: {
      [key: string]: {
        enabled: boolean;
        timeSlots: { startTime: string; endTime: string }[];
      };
    } = {
      sunday: { enabled: false, timeSlots: defaultTimeSlot },
      monday: { enabled: true, timeSlots: defaultTimeSlot },
      tuesday: { enabled: true, timeSlots: defaultTimeSlot },
      wednesday: { enabled: true, timeSlots: defaultTimeSlot },
      thursday: {
        enabled: true,
        timeSlots: [
          { startTime: "8:00 AM", endTime: "11:00 AM" },
          { startTime: "5:00 PM", endTime: "9:00 PM" },
        ],
      },
      friday: { enabled: true, timeSlots: defaultTimeSlot },
      saturday: { enabled: false, timeSlots: defaultTimeSlot },
    };

    // Override with actual data from database
    availability.weeklyHours.forEach((dayData: WeeklyHoursWithTimeSlots) => {
      // Convert uppercase enum to lowercase key for form compatibility
      const dayKey =
        dayData.dayOfWeek.toLowerCase() as keyof typeof weeklyHoursObject;
      weeklyHoursObject[dayKey] = {
        enabled: dayData.enabled,
        timeSlots: dayData.timeSlots.map(
          (slot: { startTime: string; endTime: string }) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          }),
        ),
      };
    });

    // Transform override hours
    const overrideHoursArray = availability.overrideHours.map(
      (override: OverrideHoursWithTimeSlots) => {
        const date = new Date(override.date);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();

        return {
          date: `${month}-${day}-${year}`,
          timeSlots: override.timeSlots.map(
            (slot: { startTime: string; endTime: string }) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
            }),
          ),
        };
      },
    );

    // Build booking options from database
    const bookingOptions = examinerProfile
      ? {
          maxIMEsPerWeek: examinerProfile.maxIMEsPerWeek || "",
          minimumNotice: examinerProfile.minimumNoticeValue || "",
        }
      : undefined;

    return {
      success: true,
      data: {
        weeklyHours: weeklyHoursObject,
        overrideHours: overrideHoursArray,
        bookingOptions,
      },
    };
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw HttpError.internalServerError(
      "Failed to fetch availability preferences",
    );
  }
};

export default getAvailability;
