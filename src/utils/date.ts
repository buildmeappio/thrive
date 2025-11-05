import { format } from "date-fns";

/**
 * Formats a date to short format: "MMM dd, yy"
 * Example: "Apr 18, 25"
 */
export function formatDateShort(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yy");
  } catch {
    return "N/A";
  }
}
