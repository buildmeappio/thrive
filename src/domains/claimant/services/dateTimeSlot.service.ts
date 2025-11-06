import { addMinutes, setHours, setMinutes, format } from 'date-fns';
import type { AvailabilitySettings, DayAvailability } from '../types/examinerAvailability';

export type TimeSlot = {
  hour: number;
  start: Date;
  end: Date;
};

/**
 * Generate all time slots for a day based on settings
 */
export const generateTimeSlots = (
  referenceDate: Date,
  settings: AvailabilitySettings
): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
  const [startHour, startMinute] = settings.startOfWorking.split(':').map(Number);
  const slotDurationMinutes = settings.slotDurationMinutes ?? 60;

  const baseDate = new Date(referenceDate);
  baseDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < settings.numberOfWorkingHours; i++) {
    const slotStart = addMinutes(
      setMinutes(setHours(baseDate, startHour), startMinute),
      i * slotDurationMinutes
    );
    const slotEnd = addMinutes(slotStart, slotDurationMinutes);
    const hour = slotStart.getHours();

    timeSlots.push({
      hour,
      start: slotStart,
      end: slotEnd,
    });
  }

  return timeSlots;
};

/**
 * Filter days that have available slots
 */
export const filterDaysWithSlots = (days: DayAvailability[]): DayAvailability[] => {
  return days.filter(day => day.slots.length > 0);
};

/**
 * Get days to show based on offset
 */
export const getDaysToShow = (
  daysWithSlots: DayAvailability[],
  dateOffset: number,
  maxDaysToShow: number
): DayAvailability[] => {
  return daysWithSlots.slice(dateOffset, dateOffset + maxDaysToShow);
};

/**
 * Calculate middle date index for auto-selection
 */
export const getMiddleDateIndex = (daysCount: number): number => {
  return Math.floor(daysCount / 2);
};

/**
 * Format time for display
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h a'); // Show just hour and AM/PM, e.g., "9 AM"
};

/**
 * Format date for display
 */
export const formatSqlDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Check if a date is in the past (before today)
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};
