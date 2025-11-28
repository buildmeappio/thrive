import { interpreterAvailabilityService } from "../services/availability.service";
import { HttpError } from "@/utils/httpError";
import { convertUTCToLocal } from "@/utils/timezone";
import logger from "@/utils/logger";

export type GetAvailabilityInput = {
  interpreterId: string;
};

type WeeklyHoursWithTimeSlots = {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  enabled: boolean;
  timeSlots: { startTime: string; endTime: string }[];
};

type OverrideHoursWithTimeSlots = {
  date: Date;
  timeSlots: { startTime: string; endTime: string }[];
};

const getAvailability = async (payload: GetAvailabilityInput) => {
  try {
    const availability =
      await interpreterAvailabilityService.getCompleteAvailability(
        payload.interpreterId
      );

    // If no data exists, return null to indicate no availability is set
    if (!availability.hasData) {
      return { success: true as const, data: null };
    }

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
      thursday: { enabled: true, timeSlots: defaultTimeSlot },
      friday: { enabled: true, timeSlots: defaultTimeSlot },
      saturday: { enabled: false, timeSlots: defaultTimeSlot },
    };

    availability.weeklyHours.forEach((dayData: WeeklyHoursWithTimeSlots) => {
      const dayKey =
        dayData.dayOfWeek.toLowerCase() as keyof typeof weeklyHoursObject;
      weeklyHoursObject[dayKey] = {
        enabled: dayData.enabled,
        timeSlots: dayData.timeSlots.map((slot) => ({
          startTime: convertUTCToLocal(slot.startTime, undefined, new Date()),
          endTime: convertUTCToLocal(slot.endTime, undefined, new Date()),
        })),
      };
    });

    const overrideHoursArray = availability.overrideHours.map(
      (override: OverrideHoursWithTimeSlots) => {
        const isoDate = override.date.toISOString().split("T")[0];
        const [year, month, day] = isoDate.split("-");

        return {
          date: `${month}-${day}-${year}`,
          timeSlots: override.timeSlots.map((slot) => ({
            startTime: convertUTCToLocal(slot.startTime, undefined, override.date),
            endTime: convertUTCToLocal(slot.endTime, undefined, override.date),
          })),
        };
      }
    );

    return {
      success: true as const,
      data: {
        weeklyHours: weeklyHoursObject,
        overrideHours: overrideHoursArray,
      },
    };
  } catch (error) {
    logger.error("Error fetching interpreter availability:", error);
    throw HttpError.internalServerError(
      "Failed to fetch interpreter availability"
    );
  }
};

export default getAvailability;
