/**
 * Types for examiner availability search and filtering
 */

export type AvailabilitySettings = {
  noOfDaysForWindow: number; // Number of days to show in the window (max 7)
  numberOfWorkingHours: number; // Number of working hours per day
  startOfWorking: string; // Start time in HH:mm format (e.g., "09:00") - DEPRECATED: Use startOfWorkingMinutes instead
  startOfWorkingMinutes?: number; // Start time as UTC minutes since midnight (e.g., 480 = 08:00 UTC)
  slotDurationMinutes?: number; // Duration of each slot in minutes (default: 60)
};

// Default fallback settings for availability (used when database configuration is unavailable)
// NOTE: These are fallback values only. Production settings come from the database Configuration table.
// See: src/services/configuration.service.ts
export const DEFAULT_SETTINGS: AvailabilitySettings = {
  noOfDaysForWindow: 21,
  numberOfWorkingHours: 10,
  startOfWorking: '08:00',
  startOfWorkingMinutes: 480, // 8:00 AM UTC = 480 minutes
  slotDurationMinutes: 60,
};

// Maximum number of days to show at once in the UI
export const MAX_DAYS_TO_SHOW = 7;

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
  settings: AvailabilitySettings; // Admin configuration settings used to generate availability
  serviceRequirements?: {
    interpreterRequired: boolean;
    chaperoneRequired: boolean;
    transportRequired: boolean;
  };
};

export type GetAvailableExaminersParams = {
  examId: string;
  claimantId: string; // Claimant ID to filter out declined examiners
  startDate: Date;
  settings: AvailabilitySettings;
  excludeBookingId?: string; // Exclude this booking ID from availability checks (for showing claimant's own booking)
};

export type SelectedAppointment = {
  examinerId: string;
  examinerName: string;
  date: Date;
  slotStart: Date;
  slotEnd: Date;
  specialty?: string;
  clinic?: string;
  interpreterId?: string;
  interpreter?: {
    interpreterId: string;
    companyName: string;
    contactPerson: string;
  };
  chaperoneId?: string;
  chaperone?: {
    chaperoneId: string;
    firstName: string;
    lastName: string;
  };
  transporterId?: string;
  transporter?: {
    transporterId: string;
    companyName: string;
    contactPerson: string;
  };
};

/**
 * Props for AppointmentConfirmation component
 */
export type AppointmentConfirmationProps = {
  appointment: SelectedAppointment | null;
  claimantName: string;
  onBack?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  // Reservation details for timer
  reservationExpiresAt?: string; // ISO timestamp
  examinationId?: string;
};
