import { startOfDay, addMinutes, isPast } from "date-fns";

/**
 * Builder pattern for time slots
 */

type TimeSlotsParams = {
  selectedDate: Date;
  rangeStartUtc: Date;
  rangeEndUtc: Date;
  selectedDuration: number;
  interviewSettings: {
    startWorkingHourUTC: number;
    endWorkingHourUTC: number;
  };
};

export class GenerateTimeSlots {
  private slots: Date[] = [];
  private selectedDate?: Date;
  private rangeStartUtc?: Date;
  private rangeEndUtc?: Date;
  private selectedDuration?: number;
  private interviewSettings?: {
    startWorkingHourUTC: number;
    endWorkingHourUTC: number;
  };

  constructor(data?: Partial<TimeSlotsParams>) {
    if (data?.selectedDate) {
      this.selectedDate = data.selectedDate;
    }
    if (data?.rangeStartUtc) {
      this.rangeStartUtc = data.rangeStartUtc;
    }
    if (data?.rangeEndUtc) {
      this.rangeEndUtc = data.rangeEndUtc;
    }
    if (data?.selectedDuration) {
      this.selectedDuration = data.selectedDuration;
    }
    if (data?.interviewSettings) {
      this.interviewSettings = data.interviewSettings;
    }
  }

  withSelectedDate(selectedDate: Date) {
    this.selectedDate = selectedDate;
    return this;
  }
  withUtcRange(rangeStartUtc: Date, rangeEndUtc: Date) {
    this.rangeStartUtc = rangeStartUtc;
    this.rangeEndUtc = rangeEndUtc;
    return this;
  }
  withSelectedDuration(selectedDuration: number) {
    this.selectedDuration = selectedDuration;
    return this;
  }
  withInterviewSettings(interviewSettings: {
    startWorkingHourUTC: number;
    endWorkingHourUTC: number;
  }) {
    this.interviewSettings = interviewSettings;
    return this;
  }

  private generateTimeSlots() {
    const slots: Date[] = [];

    const selectedDate = this.selectedDate || new Date();
    const rangeStartUtc = this.rangeStartUtc || new Date();
    const rangeEndUtc = this.rangeEndUtc || new Date();
    const selectedDuration = this.selectedDuration || 30;
    const interviewSettings = this.interviewSettings || {
      startWorkingHourUTC: 480,
      endWorkingHourUTC: 960,
    };

    // Generate slots by intersecting UTC working hours with the UTC range
    // This handles cases where a local day spans two UTC dates

    // Get UTC date components for the range start
    const rangeStartYear = rangeStartUtc.getUTCFullYear();
    const rangeStartMonth = rangeStartUtc.getUTCMonth();
    const rangeStartDay = rangeStartUtc.getUTCDate();

    // Start from the beginning of the UTC day containing rangeStartUtc
    let currentUtcDay = new Date(
      Date.UTC(rangeStartYear, rangeStartMonth, rangeStartDay, 0, 0, 0, 0),
    );

    // Iterate through UTC days that overlap with the range
    while (currentUtcDay < rangeEndUtc) {
      // Calculate working hours for this UTC day
      const startHours = Math.floor(interviewSettings.startWorkingHourUTC / 60);
      const startMins = interviewSettings.startWorkingHourUTC % 60;
      const dayStartWorkingTime = new Date(currentUtcDay);
      dayStartWorkingTime.setUTCHours(startHours, startMins, 0, 0);

      const endHours = Math.floor(interviewSettings.endWorkingHourUTC / 60);
      const endMins = interviewSettings.endWorkingHourUTC % 60;
      const dayEndWorkingTime = new Date(currentUtcDay);
      dayEndWorkingTime.setUTCHours(endHours, endMins, 0, 0);

      // Intersect working hours with the UTC range
      // Only generate slots that are within both the working hours AND the UTC range
      const slotStartTime =
        dayStartWorkingTime < rangeStartUtc
          ? rangeStartUtc
          : dayStartWorkingTime;
      const slotEndTime =
        dayEndWorkingTime > rangeEndUtc ? rangeEndUtc : dayEndWorkingTime;

      // Only proceed if there's a valid intersection (working hours overlap with the range)
      if (slotStartTime < slotEndTime) {
        // Generate slots within the intersected range
        let currentTime = new Date(slotStartTime);
        const maxTime = new Date(slotEndTime);
        maxTime.setMinutes(maxTime.getMinutes() - selectedDuration); // Ensure last slot fits

        // Generate slots strictly within working hours
        // Check against maxTime (which ensures slots fit) and slotEndTime (working hours boundary)
        while (currentTime <= maxTime && currentTime < slotEndTime) {
          const slotTime = new Date(currentTime);

          // Only include slots that fall on the selected date in local time
          // This ensures slots are displayed in the correct local calendar day
          const slotLocalDate = startOfDay(slotTime);
          const selectedLocalDate = startOfDay(selectedDate);

          if (slotLocalDate.getTime() === selectedLocalDate.getTime()) {
            slots.push(slotTime);
          }

          currentTime = addMinutes(currentTime, selectedDuration);
        }
      }

      // Move to the next UTC day
      currentUtcDay = new Date(currentUtcDay);
      currentUtcDay.setUTCDate(currentUtcDay.getUTCDate() + 1);
    }

    return slots;
  }

  build() {
    this.slots = this.generateTimeSlots();
    return this;
  }

  getSlots() {
    return this.slots;
  }
}

// Check if a time slot conflicts with existing bookings
export const isTimeAvailable = (
  time: Date,
  duration: number,
  existingSlots: Array<{
    id: string;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
    duration: number;
    status: string;
    isCurrentUserRequested?: boolean;
  }>,
  initialBookedSlot?: {
    id: string;
  },
): boolean => {
  const endTime = addMinutes(time, duration);

  // Check if time is in the past
  if (isPast(time)) {
    return false;
  }

  // Check if it conflicts with existing booked slots
  return !existingSlots.some((slot) => {
    if (!slot.isBooked) return false;

    // If this is the current user's booked slot, allow it
    if (initialBookedSlot && slot.id === initialBookedSlot.id) {
      return false;
    }

    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);

    // Check for any overlap
    return (
      (time >= slotStart && time < slotEnd) ||
      (endTime > slotStart && endTime <= slotEnd) ||
      (time <= slotStart && endTime >= slotEnd)
    );
  });
};

export interface Slot {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
  status: string;
  isBooked?: boolean;
  isRequested?: boolean;
  isCurrentUserRequested?: boolean;
}

export interface ParsedSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: string;
  isBooked: boolean;
  isRequested: boolean;
  isCurrentUserRequested: boolean;
}

export const parseSlots = (slots: Array<Slot>): Array<ParsedSlot> => {
  return slots
    .map((slot) => ({
      id: slot.id,
      startTime:
        typeof slot.startTime === "string"
          ? new Date(slot.startTime)
          : slot.startTime,
      endTime:
        typeof slot.endTime === "string"
          ? new Date(slot.endTime)
          : slot.endTime,
      duration: slot.duration,
      status: slot.status,
      isBooked: slot.isBooked ?? false,
      isRequested: slot.isRequested ?? false,
      isCurrentUserRequested: slot.isCurrentUserRequested ?? false,
    }))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};
