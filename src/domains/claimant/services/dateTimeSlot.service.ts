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
 * Optionally filter out past dates unless they contain a PENDING booking
 */
export const filterDaysWithSlots = (
  days: DayAvailability[],
  options?: {
    existingBooking?: {
      examinerProfileId: string;
      bookingTime: Date | string;
      status?: string;
    } | null;
    excludePastDates?: boolean;
  }
): DayAvailability[] => {
  const { existingBooking, excludePastDates = false } = options || {};

  return days.filter(day => {
    // Must have slots
    if (day.slots.length === 0) return false;

    // If not excluding past dates, keep all days with slots
    if (!excludePastDates) return true;

    // Check if this day is in the past
    const isPast = isPastDate(day.date);

    // If not past, keep it
    if (!isPast) return true;

    // If past but has no existing booking, exclude it
    if (!existingBooking) return false;

    // If past and has existing booking but it's not PENDING, exclude it
    if (existingBooking.status && existingBooking.status !== 'PENDING') return false;

    // If past and has PENDING booking, check if this day contains the booking
    const bookingTime = new Date(existingBooking.bookingTime);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    const bookingDate = new Date(bookingTime);
    bookingDate.setHours(0, 0, 0, 0);

    // Keep past date only if it contains the PENDING booking
    return dayDate.getTime() === bookingDate.getTime();
  });
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
 * Format date for display with day name
 */
export const formatSqlDate = (date: Date): string => {
  return format(date, 'EEE, MMM d, yyyy'); // Shows "Mon, Jan 15, 2025"
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
