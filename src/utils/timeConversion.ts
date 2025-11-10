/**
 * Time Conversion Utilities
 * Provides functions to convert between local time and UTC format for storing in database
 */

/**
 * Convert a time string to UTC format (HH:mm)
 * @param timeString - Time string in format "8:00 AM", "08:00", "2:30 PM", etc.
 * @param referenceDate - Reference date for conversion (defaults to today)
 * @returns Time string in UTC 24-hour format (HH:mm)
 */
export function convertTimeToUTC(timeString: string, referenceDate?: Date): string {
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
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
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
        console.warn(`Failed to parse time string: ${timeString}, returning as-is`);
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
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    // Format as HH:mm
    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error(`Error converting time to UTC: ${error}`);
    return timeString;
  }
}

/**
 * Convert time string from UTC to local timezone
 * @param utcTimeString - Time string in UTC format (HH:mm)
 * @param referenceDate - Reference date for conversion (defaults to today)
 * @returns Time string in local 12-hour format with AM/PM
 */
export function convertUTCToLocal(utcTimeString: string, referenceDate?: Date): string {
  try {
    const [hours, minutes] = utcTimeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return utcTimeString;
    }

    const refDate = referenceDate || new Date();
    const utcDate = new Date(refDate);
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Convert to local time
    const localHours = utcDate.getHours();
    const localMinutes = utcDate.getMinutes();

    // Format as 12-hour with AM/PM
    const period = localHours >= 12 ? 'PM' : 'AM';
    const displayHours = localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;

    return `${displayHours}:${localMinutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error(`Error converting UTC to local: ${error}`);
    return utcTimeString;
  }
}

/**
 * Convert a time slot object from local to UTC
 * @param slot - Time slot with startTime and endTime in local format
 * @param referenceDate - Reference date for conversion
 * @returns Time slot with startTime and endTime in UTC format
 */
export function convertTimeSlotToUTC(
  slot: { startTime: string; endTime: string },
  referenceDate?: Date
): { startTime: string; endTime: string } {
  return {
    startTime: convertTimeToUTC(slot.startTime, referenceDate),
    endTime: convertTimeToUTC(slot.endTime, referenceDate),
  };
}

/**
 * Convert a time slot object from UTC to local
 * @param slot - Time slot with startTime and endTime in UTC format
 * @param referenceDate - Reference date for conversion
 * @returns Time slot with startTime and endTime in local format
 */
export function convertTimeSlotToLocal(
  slot: { startTime: string; endTime: string },
  referenceDate?: Date
): { startTime: string; endTime: string } {
  return {
    startTime: convertUTCToLocal(slot.startTime, referenceDate),
    endTime: convertUTCToLocal(slot.endTime, referenceDate),
  };
}

/**
 * Convert weekly hours data from local to UTC
 * @param weeklyHours - Weekly hours object with time slots in local format
 * @returns Weekly hours object with time slots in UTC format
 */
export function convertWeeklyHoursToUTC(weeklyHours: any): any {
  const converted: any = {};

  for (const day in weeklyHours) {
    if (weeklyHours[day]) {
      converted[day] = {
        enabled: weeklyHours[day].enabled,
        timeSlots: weeklyHours[day].timeSlots.map((slot: any) => convertTimeSlotToUTC(slot)),
      };
    }
  }

  return converted;
}

/**
 * Convert weekly hours data from UTC to local
 * @param weeklyHours - Weekly hours object with time slots in UTC format
 * @returns Weekly hours object with time slots in local format
 */
export function convertWeeklyHoursToLocal(weeklyHours: any): any {
  const converted: any = {};

  for (const day in weeklyHours) {
    if (weeklyHours[day]) {
      converted[day] = {
        enabled: weeklyHours[day].enabled,
        timeSlots: weeklyHours[day].timeSlots.map((slot: any) => convertTimeSlotToLocal(slot)),
      };
    }
  }

  return converted;
}

/**
 * Convert override hours data from local to UTC
 * @param overrideHours - Array of override hours with time slots in local format
 * @returns Array of override hours with time slots in UTC format
 */
export function convertOverrideHoursToUTC(
  overrideHours: Array<{ date: string; timeSlots: Array<{ startTime: string; endTime: string }> }>
): Array<{ date: string; timeSlots: Array<{ startTime: string; endTime: string }> }> {
  return overrideHours.map(override => ({
    date: override.date,
    timeSlots: override.timeSlots.map(slot => convertTimeSlotToUTC(slot)),
  }));
}

/**
 * Convert override hours data from UTC to local
 * @param overrideHours - Array of override hours with time slots in UTC format
 * @returns Array of override hours with time slots in local format
 */
export function convertOverrideHoursToLocal(
  overrideHours: Array<{ date: string; timeSlots: Array<{ startTime: string; endTime: string }> }>
): Array<{ date: string; timeSlots: Array<{ startTime: string; endTime: string }> }> {
  return overrideHours.map(override => ({
    date: override.date,
    timeSlots: override.timeSlots.map(slot => convertTimeSlotToLocal(slot)),
  }));
}

/**
 * Convert entire availability preferences data from local to UTC
 * @param data - Availability preferences with time slots in local format
 * @returns Availability preferences with time slots in UTC format
 */
export function convertAvailabilityToUTC(data: any): any {
  return {
    ...data,
    weeklyHours: data.weeklyHours ? convertWeeklyHoursToUTC(data.weeklyHours) : undefined,
    overrideHours: data.overrideHours ? convertOverrideHoursToUTC(data.overrideHours) : undefined,
  };
}

/**
 * Convert entire availability preferences data from UTC to local
 * @param data - Availability preferences with time slots in UTC format
 * @returns Availability preferences with time slots in local format
 */
export function convertAvailabilityToLocal(data: any): any {
  return {
    ...data,
    weeklyHours: data.weeklyHours ? convertWeeklyHoursToLocal(data.weeklyHours) : undefined,
    overrideHours: data.overrideHours ? convertOverrideHoursToLocal(data.overrideHours) : undefined,
  };
}
