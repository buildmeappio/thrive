export type TimeSlot = {
  id?: string;
  startTime: string; // "08:00 AM"
  endTime: string; // "11:00 AM"
};

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type WeeklyHours = {
  id?: string;
  dayOfWeek: Weekday;
  enabled: boolean;
  timeSlots: TimeSlot[];
};

export type OverrideHours = {
  id?: string;
  date: string; // ISO date string "YYYY-MM-DD"
  timeSlots: TimeSlot[];
};

export type AvailabilityData = {
  weeklyHours: WeeklyHours[];
  overrideHours: OverrideHours[];
};

export type CreateAvailabilityInput = {
  providerType: "CHAPERONE" | "EXAMINER" | "INTERPRETER" | "TRANSPORTER";
  refId: string;
  weeklyHours: {
    dayOfWeek: Weekday;
    enabled: boolean;
    timeSlots: { startTime: string; endTime: string }[];
  }[];
  overrideHours: {
    date: string;
    timeSlots: { startTime: string; endTime: string }[];
  }[];
};

export type UpdateAvailabilityInput = Partial<
  Omit<CreateAvailabilityInput, "providerType" | "refId">
>;
