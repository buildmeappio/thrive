import type {
  DayAvailability,
  ExaminerAvailabilityOption,
  SlotAvailability,
  SelectedAppointment,
} from '../types/examinerAvailability';
import type { TimeSlot } from './dateTimeSlot.service';

/**
 * Check if a slot matches an existing booking
 */
export const isExistingBookingSlot = (
  day: DayAvailability,
  timeSlot: TimeSlot,
  examinerId: string,
  existingBooking?: {
    examinerProfileId: string;
    bookingTime: Date | string;
  } | null
): boolean => {
  if (!existingBooking) return false;

  const bookingTime = new Date(existingBooking.bookingTime);
  const slotDate = new Date(day.date);
  const slotStart = new Date(timeSlot.start);

  // Check if dates match (same day)
  const isSameDay =
    slotDate.getFullYear() === bookingTime.getFullYear() &&
    slotDate.getMonth() === bookingTime.getMonth() &&
    slotDate.getDate() === bookingTime.getDate();

  // Check if time matches (same hour)
  const isSameTime = slotStart.getHours() === bookingTime.getHours();

  // Check if examiner matches
  const isSameExaminer = examinerId === existingBooking.examinerProfileId;

  return isSameDay && isSameTime && isSameExaminer;
};

/**
 * Get all examiners for a specific slot (max 3)
 */
export const getExaminersForSlot = (
  day: DayAvailability,
  hour: number
): { examiners: ExaminerAvailabilityOption[]; slot: SlotAvailability } | null => {
  console.log(`[getExaminersForSlot] Looking for hour: ${hour}`);
  console.log(
    `[getExaminersForSlot] Available slots on this day:`,
    day.slots.map(s => ({
      hour: s.start.getHours(),
      time: s.start.toString().split(' ')[4], // Just the time part
      examiners: s.examiners.length,
    }))
  );

  const matchingSlot = day.slots.find(slot => slot.start.getHours() === hour);

  if (matchingSlot) {
    console.log(
      `[getExaminersForSlot] ✓ Found slot for hour ${hour}: ${matchingSlot.examiners.length} examiner(s)`
    );
  } else {
    console.log(`[getExaminersForSlot] ✗ No slot found for hour ${hour}`);
  }

  if (matchingSlot && matchingSlot.examiners.length > 0) {
    return { examiners: matchingSlot.examiners, slot: matchingSlot };
  }
  return null;
};

/**
 * Transform examiner and slot data into a selected appointment
 */
export const createSelectedAppointment = (
  examiner: ExaminerAvailabilityOption,
  slot: SlotAvailability,
  day: DayAvailability
): SelectedAppointment => {
  return {
    examinerId: examiner.examinerId,
    examinerName: examiner.examinerName,
    date: day.date,
    slotStart: slot.start,
    slotEnd: slot.end,
    specialty: examiner.specialty,
    clinic: examiner.clinic,
    interpreterId:
      examiner.interpreters && examiner.interpreters.length > 0
        ? examiner.interpreters[0].interpreterId
        : undefined,
    interpreter:
      examiner.interpreters && examiner.interpreters.length > 0
        ? {
            interpreterId: examiner.interpreters[0].interpreterId,
            companyName: examiner.interpreters[0].companyName,
            contactPerson: examiner.interpreters[0].contactPerson,
          }
        : undefined,
    chaperoneId:
      examiner.chaperones && examiner.chaperones.length > 0
        ? examiner.chaperones[0].chaperoneId
        : undefined,
    chaperone:
      examiner.chaperones && examiner.chaperones.length > 0
        ? {
            chaperoneId: examiner.chaperones[0].chaperoneId,
            firstName: examiner.chaperones[0].firstName,
            lastName: examiner.chaperones[0].lastName,
          }
        : undefined,
    transporterId:
      examiner.transporters && examiner.transporters.length > 0
        ? examiner.transporters[0].transporterId
        : undefined,
    transporter:
      examiner.transporters && examiner.transporters.length > 0
        ? {
            transporterId: examiner.transporters[0].transporterId,
            companyName: examiner.transporters[0].companyName,
            contactPerson: examiner.transporters[0].contactPerson,
          }
        : undefined,
  };
};
