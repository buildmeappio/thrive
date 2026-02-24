/**
 * Time conversion and availability types
 */

/**
 * Time slot with start and end times
 */
export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * Day of the week
 */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Weekly hours for a specific day
 */
export interface DayHours {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

/**
 * Weekly hours structure
 */
export type WeeklyHours = Record<DayOfWeek, DayHours>;

/**
 * Override hours for specific dates
 */
export interface OverrideHours {
  date: string;
  timeSlots: TimeSlot[];
}

/**
 * Availability preferences structure
 */
export interface AvailabilityPreferences {
  weeklyHours?: WeeklyHours;
  overrideHours?: OverrideHours[];
  bookingOptions?: Record<string, unknown>;
}
