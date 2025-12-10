import {
  saveCompleteAvailability ,
  type WeeklyHoursData,
  type OverrideHoursData,
} from "../services/availability.service";
import logger from "@/utils/logger";
import { HttpError } from "@/utils/httpError";

export type SaveAvailabilityInput = {
  interpreterId: string;
  weeklyHours: {
    [key: string]: { enabled: boolean; timeSlots: { startTime: string; endTime: string }[] };
  };
  overrideHours?: { date: string; timeSlots: { startTime: string; endTime: string }[] }[];
};

const saveAvailability = async (payload: SaveAvailabilityInput) => {
  try {
    const weeklyHoursArray: WeeklyHoursData[] = Object.entries(payload.weeklyHours).map(
      ([dayOfWeek, data]) => ({
        dayOfWeek: dayOfWeek.toUpperCase() as
          | "MONDAY"
          | "TUESDAY"
          | "WEDNESDAY"
          | "THURSDAY"
          | "FRIDAY"
          | "SATURDAY"
          | "SUNDAY",
        enabled: data.enabled,
        timeSlots: data.timeSlots,
      })
    );

    const overrideHoursArray: OverrideHoursData[] = payload.overrideHours || [];

    await saveCompleteAvailability(payload.interpreterId, {
      weeklyHours: weeklyHoursArray,
      overrideHours: overrideHoursArray,
    });

    return { success: true as const, message: "Availability preferences saved successfully" };
  } catch (error) {
    logger.error("Error saving interpreter availability:", error);
    throw HttpError.internalServerError("Failed to save interpreter availability");
  }
};

export default saveAvailability;


