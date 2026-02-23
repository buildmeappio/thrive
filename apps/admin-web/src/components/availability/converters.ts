import { WeeklyHoursState, OverrideHoursState } from "./types";
import {
  WeeklyHours,
  OverrideHours,
  Weekday,
} from "@/domains/services/types/Availability";

const DAY_ORDER: Weekday[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const weeklyStateToArray = (state: WeeklyHoursState): WeeklyHours[] => {
  return DAY_ORDER.map((day) => {
    const key = day.toLowerCase();
    const dayState = state[key] || { enabled: false, timeSlots: [] };
    return {
      dayOfWeek: day,
      enabled: dayState.enabled,
      timeSlots: dayState.timeSlots,
    };
  });
};

export const weeklyArrayToState = (array: WeeklyHours[]): WeeklyHoursState => {
  const state: WeeklyHoursState = {};
  array.forEach((day) => {
    const key = day.dayOfWeek.toLowerCase();
    state[key] = {
      enabled: day.enabled,
      timeSlots: day.timeSlots,
    };
  });
  return state;
};

const MM_DD_YYYY_REGEX = /^\d{2}-\d{2}-\d{4}$/;
const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_WITH_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T/;

type DateParts = { year: number; month: number; day: number };

const extractDateParts = (dateStr: string): DateParts | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  if (YYYY_MM_DD_REGEX.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    return { year, month, day };
  }

  if (ISO_WITH_TIME_REGEX.test(trimmed)) {
    const [datePart] = trimmed.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    return { year, month, day };
  }

  if (MM_DD_YYYY_REGEX.test(trimmed)) {
    const [month, day, year] = trimmed.split("-").map(Number);
    return { year, month, day };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
};

const toISODate = (dateStr: string): string | null => {
  const parts = extractDateParts(dateStr);
  if (!parts) return null;
  const { year, month, day } = parts;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const toDisplayDate = (dateStr: string): string => {
  const parts = extractDateParts(dateStr);
  if (!parts) {
    return dateStr;
  }
  const { year, month, day } = parts;
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${mm}-${dd}-${year}`;
};

export const overrideDateToLocalDate = (dateStr: string): Date | null => {
  const parts = extractDateParts(dateStr);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day);
};

export const normalizeOverrideDate = (dateStr: string): string => {
  return toISODate(dateStr) ?? dateStr;
};

export const formatOverrideDisplayDate = (dateStr: string): string => {
  return toDisplayDate(dateStr);
};

export const overrideStateToArray = (
  state: OverrideHoursState,
): OverrideHours[] => {
  return state.map((override) => ({
    date: toISODate(override.date) ?? override.date,
    timeSlots: override.timeSlots,
  }));
};

export const overrideArrayToState = (
  array: OverrideHours[],
): OverrideHoursState => {
  return array.map((override) => ({
    date: toDisplayDate(override.date),
    timeSlots: override.timeSlots,
  }));
};
