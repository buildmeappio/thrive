import type { InterviewData } from "./InterviewData";

/**
 * Status color configuration
 */
export interface StatusColorConfig {
  gradient: string;
  text: string;
  legendColor: string;
}

/**
 * Status color mapping
 */
export type StatusColors = Record<string, StatusColorConfig>;

/**
 * Props for InterviewSlot component
 */
export interface InterviewSlotProps {
  interview: InterviewData;
}

/**
 * Props for DayCell component
 */
export interface DayCellProps {
  day: number | null;
  interviews: InterviewData[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

/**
 * Props for InterviewCalendarView component
 */
export interface InterviewCalendarViewProps {
  data: InterviewData[];
}

/**
 * Calendar constants
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const DAY_NAMES = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

/**
 * Status color mapping - solid colors: primary blue for booked, secondary green for completed
 */
export const STATUS_COLORS: StatusColors = {
  booked: {
    gradient: "bg-[#00A8FF]",
    text: "text-white",
    legendColor: "bg-[#00A8FF]",
  },
  completed: {
    gradient: "bg-[#000080]",
    text: "text-white",
    legendColor: "bg-[#000080]",
  },
};
