import { startOfDay, addMinutes, isPast } from "date-fns";

/**
 * Builder pattern for time slots
 */

type TimeSlotsParams = {
  selectedDate: Date;
  selectedDuration: number;
  interviewSettings: {
    startWorkingHourUTC: number;
    endWorkingHourUTC: number;
  };
};

export class GenerateTimeSlots {
  private slots: Date[] = [];
  private selectedDate?: Date;
  private selectedDuration?: number;
  private interviewSettings?: {
    startWorkingHourUTC: number;
    endWorkingHourUTC: number;
  };

  constructor(data?: Partial<TimeSlotsParams>) {
    if (data?.selectedDate) {
      this.selectedDate = data.selectedDate;
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
    const selectedDuration = this.selectedDuration || 30;
    const interviewSettings = this.interviewSettings || {
      startWorkingHourUTC: 480,
      endWorkingHourUTC: 960,
    };

    // Get the selected date components in local timezone
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    // Create UTC date for the selected day at midnight UTC
    const dayStartUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));

    // Apply UTC working hours to the UTC date
    const startHours = Math.floor(interviewSettings.startWorkingHourUTC / 60);
    const startMins = interviewSettings.startWorkingHourUTC % 60;
    const startWorkingTimeUTC = new Date(dayStartUTC);
    startWorkingTimeUTC.setUTCHours(startHours, startMins, 0, 0);

    const endHours = Math.floor(interviewSettings.endWorkingHourUTC / 60);
    const endMins = interviewSettings.endWorkingHourUTC % 60;
    const endWorkingTimeUTC = new Date(dayStartUTC);
    endWorkingTimeUTC.setUTCHours(endHours, endMins, 0, 0);

    // Filter slots to only include those that fall on the selected date in local time
    // This ensures that if UTC time converts to previous/next day in local time, we exclude it
    let currentTime = new Date(startWorkingTimeUTC);
    const maxTime = new Date(endWorkingTimeUTC);
    maxTime.setMinutes(maxTime.getMinutes() - selectedDuration); // Ensure last slot fits

    while (currentTime <= maxTime) {
      const slotTime = new Date(currentTime);
      // Only include slots that are on the selected date in local time
      const slotLocalDate = startOfDay(slotTime);
      const selectedLocalDate = startOfDay(selectedDate);

      if (slotLocalDate.getTime() === selectedLocalDate.getTime()) {
        slots.push(slotTime);
      }

      currentTime = addMinutes(currentTime, selectedDuration);
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
