/**
 * Types for examiner availability search and filtering
 */

export type AvailabilitySettings = {
  noOfDaysForWindow: number; // Number of days to show in the window (max 7)
  numberOfWorkingHours: number; // Number of working hours per day
  startOfWorking: string; // Start time in HH:mm format (e.g., "09:00")
  slotDurationMinutes?: number; // Duration of each slot in minutes (default: 60)
};

export type AvailableInterpreter = {
  interpreterId: string;
  companyName: string;
  contactPerson: string;
  providerId: string;
};

export type AvailableChaperone = {
  chaperoneId: string;
  firstName: string;
  lastName: string;
  providerId: string;
};

export type AvailableTransporter = {
  transporterId: string;
  companyName: string;
  contactPerson: string;
  providerId: string;
};

export type ExaminerAvailabilityOption = {
  examinerId: string;
  examinerName: string;
  providerId: string;
  specialty?: string;
  clinic?: string; // Clinic name or address
  interpreters?: AvailableInterpreter[]; // Available interpreters for this slot
  chaperones?: AvailableChaperone[]; // Available chaperones for this slot
  transporters?: AvailableTransporter[]; // Available transporters for this slot
};

export type SlotAvailability = {
  start: Date;
  end: Date;
  examiners: ExaminerAvailabilityOption[];
};

export type DayAvailability = {
  date: Date;
  weekday: string;
  slots: SlotAvailability[];
};

export type AvailableExaminersResult = {
  examId: string;
  startDate: Date;
  endDate: Date;
  dueDate: Date | null;
  days: DayAvailability[];
};

export type GetAvailableExaminersParams = {
  examId: string;
  startDate: Date;
  settings: AvailabilitySettings;
};
