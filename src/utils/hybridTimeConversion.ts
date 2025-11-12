/**
 * Hybrid Time Conversion Utilities
 *
 * This module handles time display for mixed time formats:
 * - Times with AM/PM (12-hour format): Display as-is (no conversion)
 * - Times without AM/PM (24-hour format): Treat as UTC, convert to user's local timezone
 *
 * This approach allows backward compatibility with legacy data while supporting
 * proper timezone handling for new UTC-based data.
 */

/**
 * Check if a time string is in 12-hour format with AM/PM
 */
export function is12HourFormat(timeStr: string): boolean {
  return /AM|PM/i.test(timeStr);
}

/**
 * Parse time string and return hours and minutes
 * Handles both "8:00 AM" and "08:00" formats
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const is12Hour = is12HourFormat(timeStr);

  if (is12Hour) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid 12-hour time format: ${timeStr}`);
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  } else {
    const [hh, mm] = timeStr.split(':').map(Number);
    return { hours: hh ?? 0, minutes: mm ?? 0 };
  }
}

/**
 * Convert time string to display format based on hybrid approach
 *
 * @param timeStr - Time string from database (e.g., "8:00 AM" or "03:00")
 * @param options - Formatting options
 * @returns Formatted time string for display
 */
export function convertTimeForDisplay(
  timeStr: string,
  options: { format12Hour?: boolean } = {}
): string {
  const { format12Hour = true } = options;

  // If already in 12-hour format with AM/PM, return as-is
  if (is12HourFormat(timeStr)) {
    return timeStr;
  }

  // 24-hour format without AM/PM: Treat as UTC, convert to local
  const { hours, minutes } = parseTimeString(timeStr);

  // Create a Date object in UTC with these hours/minutes
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);

  // Get local time
  const localHours = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();

  // Format output
  if (format12Hour) {
    const period = localHours >= 12 ? 'PM' : 'AM';
    const displayHours = localHours === 0 ? 12 : localHours > 12 ? localHours - 12 : localHours;
    return `${displayHours}:${localMinutes.toString().padStart(2, '0')} ${period}`;
  } else {
    return `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`;
  }
}

/**
 * Convert time range for display
 *
 * @param startTime - Start time string
 * @param endTime - End time string
 * @returns Formatted time range string
 */
export function convertTimeRangeForDisplay(
  startTime: string,
  endTime: string,
  options?: { format12Hour?: boolean }
): string {
  const start = convertTimeForDisplay(startTime, options);
  const end = convertTimeForDisplay(endTime, options);
  return `${start} - ${end}`;
}

/**
 * Get minutes since midnight in user's local timezone
 * Used for time comparisons on the frontend
 *
 * @param timeStr - Time string from database
 * @returns Minutes since midnight in local timezone
 */
export function getLocalMinutesFromTimeString(timeStr: string): number {
  // If has AM/PM, parse directly as local time
  if (is12HourFormat(timeStr)) {
    const { hours, minutes } = parseTimeString(timeStr);
    return hours * 60 + minutes;
  }

  // 24-hour format: Treat as UTC, convert to local
  const { hours, minutes } = parseTimeString(timeStr);
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);

  const localHours = utcDate.getHours();
  const localMinutes = utcDate.getMinutes();

  return localHours * 60 + localMinutes;
}

/**
 * Check if a time slot falls within a time window (both in local time)
 *
 * @param slotStart - Slot start time string
 * @param slotEnd - Slot end time string
 * @param windowStart - Window start time string
 * @param windowEnd - Window end time string
 * @returns True if slot fits within window
 */
export function isSlotWithinWindow(
  slotStart: string,
  slotEnd: string,
  windowStart: string,
  windowEnd: string
): boolean {
  const slotStartMins = getLocalMinutesFromTimeString(slotStart);
  const slotEndMins = getLocalMinutesFromTimeString(slotEnd);
  const windowStartMins = getLocalMinutesFromTimeString(windowStart);
  const windowEndMins = getLocalMinutesFromTimeString(windowEnd);

  return slotStartMins >= windowStartMins && slotEndMins <= windowEndMins;
}
