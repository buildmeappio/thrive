import logger from "@/utils/logger";

/**
 * Convert a time string to UTC format (HH:mm)
 * @param timeString - Time string in format "8:00 AM", "08:00", "2:30 PM", etc.
 * @param timezone - IANA timezone identifier (e.g., "America/Toronto"). Defaults to system timezone
 * @param referenceDate - Reference date for conversion (defaults to today)
 * @returns Time string in UTC 24-hour format (HH:mm)
 */
export function convertTimeToUTC(
  timeString: string,
  timezone?: string,
  referenceDate?: Date,
): string {
  try {
    const trimmedTime = timeString.trim();
    let hours = 0;
    let minutes = 0;

    // Parse 12-hour format (e.g., "8:00 AM", "2:30 PM")
    const time12HourMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (time12HourMatch) {
      hours = parseInt(time12HourMatch[1], 10);
      minutes = parseInt(time12HourMatch[2], 10);
      const period = time12HourMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
    } else {
      // Parse 24-hour format (HH:mm or H:mm)
      const time24HourMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})$/);
      if (time24HourMatch) {
        hours = parseInt(time24HourMatch[1], 10);
        minutes = parseInt(time24HourMatch[2], 10);
      } else {
        // If parsing fails, return original
        console.warn(
          `Failed to parse time string: ${timeString}, returning as-is`,
        );
        return trimmedTime;
      }
    }

    // Validate hours and minutes
    if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
      console.warn(`Invalid time values: ${hours}:${minutes}, returning as-is`);
      return trimmedTime;
    }

    // Create date object with reference date and parsed time in local timezone
    const refDate = referenceDate || new Date();
    const localDate = new Date(refDate);
    localDate.setHours(hours, minutes, 0, 0);

    // Get UTC equivalent
    // The setHours() method sets time in local timezone, so getUTCHours() gives us UTC
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    // Format as HH:mm
    return `${utcHours.toString().padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")}`;
  } catch (error) {
    logger.error(`Error converting time to UTC: ${error}`);
    return timeString;
  }
}

/**
 * Convert time string from UTC to local timezone
 * @param utcTimeString - Time string in UTC format (HH:mm)
 * @param timezone - IANA timezone identifier (optional)
 * @param referenceDate - Reference date for conversion
 * @returns Time string in local format
 */
export function convertUTCToLocal(
  utcTimeString: string,
  timezone?: string,
  referenceDate?: Date,
): string {
  try {
    const trimmedTime = utcTimeString.trim();

    // Check if already in 12-hour format (has AM/PM), return as-is
    if (/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(trimmedTime)) {
      return trimmedTime;
    }

    // Parse UTC time string (HH:mm format)
    const timeMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      console.warn(
        `Failed to parse UTC time string: ${utcTimeString}, returning as-is`,
      );
      return trimmedTime;
    }

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    // Validate hours and minutes
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours >= 24 ||
      minutes < 0 ||
      minutes >= 60
    ) {
      console.warn(
        `Invalid UTC time values: ${hours}:${minutes}, returning as-is`,
      );
      return trimmedTime;
    }

    const refDate = referenceDate || new Date();
    const utcDate = new Date(refDate);
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Convert to local time
    const localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();

    // Format as 12-hour with AM/PM
    const period = localHours >= 12 ? "PM" : "AM";
    const displayHours =
      localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;

    return `${displayHours}:${localMinutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    logger.error(`Error converting UTC to local: ${error}`);
    return utcTimeString;
  }
}

/**
 * Convert UTC minutes to local time string in 12-hour format
 * @param utcMinutes - Total minutes from midnight in UTC (e.g., 480 = 8:00 AM UTC)
 * @param referenceDate - Reference date for conversion (defaults to today)
 * @returns Time string in local 12-hour format (e.g., "3:00 AM")
 */
export function convertUTCMinutesToLocal(
  utcMinutes: number,
  referenceDate?: Date,
): string {
  try {
    // Validate input
    if (isNaN(utcMinutes) || utcMinutes < 0 || utcMinutes >= 1440) {
      console.warn(`Invalid UTC minutes: ${utcMinutes}, returning as-is`);
      return String(utcMinutes);
    }

    // Convert minutes to hours and minutes
    const hours = Math.floor(utcMinutes / 60);
    const minutes = utcMinutes % 60;

    // Create a date object with UTC time
    const refDate = referenceDate || new Date();
    const utcDate = new Date(refDate);
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Convert to local time
    const localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();

    // Format as 12-hour with AM/PM
    const period = localHours >= 12 ? "PM" : "AM";
    const displayHours =
      localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;

    return `${displayHours}:${localMinutes.toString().padStart(2, "0")} ${period}`;
  } catch (error) {
    logger.error(`Error converting UTC minutes to local: ${error}`);
    return String(utcMinutes);
  }
}

/**
 * Convert local time string to UTC minutes (CLIENT-SIDE ONLY)
 * This function runs in the browser and uses the browser's timezone
 * @param timeString - Time string in format "8:00 AM", "08:00", "2:30 PM", etc.
 * @param referenceDate - Reference date for conversion (defaults to today)
 * @returns Total UTC minutes from midnight (0-1439)
 */
export function convertLocalTimeToUTCMinutes(
  timeString: string,
  referenceDate?: Date,
): number {
  try {
    const trimmedTime = timeString.trim();
    let hours = 0;
    let minutes = 0;

    // Parse 12-hour format (e.g., "8:00 AM", "2:30 PM")
    const time12HourMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (time12HourMatch) {
      hours = parseInt(time12HourMatch[1], 10);
      minutes = parseInt(time12HourMatch[2], 10);
      const period = time12HourMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === "PM" && hours !== 12) {
        hours += 12;
      } else if (period === "AM" && hours === 12) {
        hours = 0;
      }
    } else {
      // Parse 24-hour format (HH:mm or H:mm)
      const time24HourMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})$/);
      if (time24HourMatch) {
        hours = parseInt(time24HourMatch[1], 10);
        minutes = parseInt(time24HourMatch[2], 10);
      } else {
        throw new Error(`Invalid time format: ${timeString}`);
      }
    }

    // Validate hours and minutes
    if (hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
      throw new Error(`Invalid time values: ${hours}:${minutes}`);
    }

    // Create date object with local time (browser's timezone)
    const refDate = referenceDate || new Date();
    const localDate = new Date(refDate);
    localDate.setHours(hours, minutes, 0, 0);

    // Get UTC equivalent
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    // Convert to total minutes
    return utcHours * 60 + utcMinutes;
  } catch (error) {
    logger.error(`Error converting local time to UTC minutes: ${error}`);
    throw error;
  }
}
