/**
 * Get the UTC time range that corresponds to a local calendar day.
 *
 * When a user selects a date in their local timezone (e.g., "2025-01-15"),
 * we need to find the UTC time range that covers that entire local day.
 *
 * Example: For a user in UTC+5:30 selecting Jan 15:
 * - Local day start: Jan 15 00:00:00 IST = Jan 14 18:30:00 UTC
 * - Local day end: Jan 16 00:00:00 IST = Jan 15 18:30:00 UTC
 *
 * This function returns [startUtc, endUtc) where:
 * - startUtc: UTC instant of local midnight on the selected date
 * - endUtc: UTC instant of local midnight on the next day (exclusive)
 */
export const getLocalDayUtcRange = (localDate: Date): [Date, Date] => {
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();

  // Create local midnight for the selected day
  const localDayStart = new Date(year, month, day, 0, 0, 0, 0);

  // Create local midnight for the next day
  const localDayEnd = new Date(year, month, day + 1, 0, 0, 0, 0);

  // These Date objects already contain the correct UTC timestamps
  // (JavaScript Date internally stores UTC timestamps)
  return [localDayStart, localDayEnd];
};

/**
 * @deprecated Use getLocalDayUtcRange instead. This function incorrectly
 * constructs UTC midnight of the same Y/M/D, which is not the same as
 * local midnight in UTC for most timezones.
 */
export const toUtcMidnightOfLocalDay = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

export const parseDate = (date?: string | Date | undefined) => {
  if (!date) return undefined;
  return typeof date === "string" ? new Date(date) : date;
};

export const getDuration = (
  startTime?: Date | undefined,
  endTime?: Date | undefined,
) => {
  if (!startTime || !endTime) return undefined;
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
};
