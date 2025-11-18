import { format } from "date-fns";

/**
 * Formats a date to short format: "MMM dd, yyyy"
 * Example: "Apr 18, 2025"
 */
export function formatDateShort(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  } catch {
    return "N/A";
  }
}

/**
 * Formats a date and time together: "MMM dd, yyyy h:mma"
 * Example: "Apr 18, 2025 11:30pm"
 */
export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy h:mma");
  } catch {
    return "N/A";
  }
}

/**
 * Formats appointment date: "MMM dd, yyyy"
 * Example: "Nov 18, 2025"
 */
export function formatAppointmentDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  } catch {
    return "N/A";
  }
}

/**
 * Formats appointment time: "h:mma"
 * Example: "8:00 AM"
 */
export function formatAppointmentTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "h:mm a");
  } catch {
    return "N/A";
  }
}