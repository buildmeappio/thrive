/**
 * IMPORTANT: We must query slots by the intended "calendar day" consistently.
 * The UI selects a day in the user's local timezone, but server actions run in
 * server timezone (often UTC). Passing a local Date directly can cause
 * startOfDay/endOfDay on the server to shift to the wrong day (commonly for
 * timezones ahead of UTC), so booked slots appear missing.
 *
 * To fix this, we always send "UTC midnight of the selected local Y/M/D".
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
