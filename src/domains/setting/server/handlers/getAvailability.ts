import { availabilityService } from "../services/availability.service";
import HttpError from "@/utils/httpError";

export type GetAvailabilityInput = {
  examinerProfileId: string;
};

const getAvailability = async (payload: GetAvailabilityInput) => {
  try {
    const availability = await availabilityService.getCompleteAvailability(
      payload.examinerProfileId
    );

    // Initialize with default values for all days
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
    availability.weeklyHours.forEach((dayData) => {
      weeklyHoursObject[dayData.dayOfWeek] = {
        enabled: dayData.enabled,
        timeSlots: dayData.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };
    });

    // Transform override hours
    const overrideHoursArray = availability.overrideHours.map((override) => {
      const date = new Date(override.date);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();

      return {
        date: `${month}-${day}-${year}`,
        timeSlots: override.timeSlots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      };
    });

    return {
      success: true,
      data: {
        weeklyHours: weeklyHoursObject,
        overrideHours: overrideHoursArray,
        bookingOptions: availability.bookingOptions
          ? {
              bufferTime: availability.bookingOptions.bufferTime ?? undefined,
              advanceBooking:
                availability.bookingOptions.advanceBooking ?? undefined,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching availability:", error);
    throw HttpError.internalServerError(
      "Failed to fetch availability preferences"
    );
  }
};

export default getAvailability;
