export type TimeSlot = { startTime: string; endTime: string };

export type WeeklyHoursState = {
  [day: string]: { enabled: boolean; timeSlots: TimeSlot[] };
};

export type OverrideHoursState = Array<{
  date: string; // MM-DD-YYYY
  timeSlots: TimeSlot[];
}>;
