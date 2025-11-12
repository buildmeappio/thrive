import type {
  AvailableExaminersResult,
  ExaminerAvailabilityOption,
  AvailabilitySettings,
} from '../types/examinerAvailability';
import { generateTimeSlots, filterDaysWithSlots } from '../services/dateTimeSlot.service';

/**
 * Process availability data from server (convert string dates to Date objects)
 */
export const processAvailabilityData = (
  result: AvailableExaminersResult
): AvailableExaminersResult => {
  return {
    ...result,
    days: result.days.map(
      (day: {
        date: string | Date;
        weekday: string;
        slots: Array<{
          start: string | Date;
          end: string | Date;
          examiners: ExaminerAvailabilityOption[];
        }>;
      }) => ({
        ...day,
        date: new Date(day.date),
        weekday: day.weekday,
        slots: day.slots.map(
          (slot: {
            start: string | Date;
            end: string | Date;
            examiners: ExaminerAvailabilityOption[];
          }) => ({
            ...slot,
            start: new Date(slot.start),
            end: new Date(slot.end),
            examiners: slot.examiners,
          })
        ),
      })
    ),
    startDate: new Date(result.startDate),
    endDate: new Date(result.endDate),
    dueDate: result.dueDate ? new Date(result.dueDate) : null,
  };
};

/**
 * Get time slots array for the availability data
 * Uses settings from availabilityData if available, otherwise falls back to provided settings
 */
export const getTimeSlotsForAvailability = (
  availabilityData: AvailableExaminersResult | null,
  fallbackSettings: AvailabilitySettings
) => {
  // Use settings from availability data if available, otherwise use fallback
  const settings = availabilityData?.settings || fallbackSettings;

  if (!availabilityData) {
    const referenceDate = new Date();
    return generateTimeSlots(referenceDate, settings);
  }

  const daysWithSlots = filterDaysWithSlots(availabilityData.days);
  const referenceDate = daysWithSlots.length > 0 ? daysWithSlots[0].date : new Date();
  return generateTimeSlots(referenceDate, settings);
};

/**
 * Auto-select middle date and first time slot
 */
export const getAutoSelection = (
  availabilityData: AvailableExaminersResult | null,
  timeSlotsArray: Array<{ hour: number; start: Date; end: Date }>,
  maxDaysToShow: number = 7
): { dateIndex: number; timeSlot: { start: Date; end: Date } } | null => {
  if (!availabilityData) return null;

  const daysWithSlots = filterDaysWithSlots(availabilityData.days);
  const daysToShowForSelection = daysWithSlots.slice(0, maxDaysToShow);

  if (daysToShowForSelection.length === 0 || timeSlotsArray.length === 0) {
    return null;
  }

  const middleIndex = Math.floor(daysToShowForSelection.length / 2);
  const middleDay = daysToShowForSelection[middleIndex];

  if (!middleDay || middleDay.slots.length === 0) {
    return null;
  }

  const firstTimeSlot = timeSlotsArray[0];

  // Check if the middle date has slots for the first time
  const hasSlotForFirstTime = middleDay.slots.some(
    slot => slot.start.getHours() === firstTimeSlot.hour
  );

  if (hasSlotForFirstTime) {
    return {
      dateIndex: middleIndex,
      timeSlot: firstTimeSlot,
    };
  }

  // If first time doesn't have a slot, try to find the first available time
  const firstAvailableSlot = middleDay.slots[0];
  if (firstAvailableSlot) {
    const matchingTimeSlot = timeSlotsArray.find(
      ts => ts.start.getHours() === firstAvailableSlot.start.getHours()
    );
    if (matchingTimeSlot) {
      return {
        dateIndex: middleIndex,
        timeSlot: matchingTimeSlot,
      };
    }
  }

  return null;
};
