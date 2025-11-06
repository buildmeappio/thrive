import type { SelectedAppointment } from './examinerAvailability';

export type ExaminerOptionsState = {
  loading: boolean;
  errorMessage: string | null;
  selectedDateIndex: number | null;
  selectedTimeSlot: { start: Date; end: Date } | null;
  dateOffset: number;
  hasAutoSelected: boolean;
};

export type ExaminerOptionsHandlers = {
  handleDateClick: (dayIndex: number) => void;
  handleTimeClick: (timeSlot: { start: Date; end: Date }) => void;
  handleSlotSelection: (examiner: any, slot: any, day: any) => void;
  handlePrevious: () => void;
  handleNext: () => void;
};

export type ExaminerOptionsProps = {
  examId: string;
  caseId: string;
  existingBooking?: {
    id: string;
    examinerProfileId: string;
    examinerName: string | null;
    bookingTime: Date | string;
    interpreterId?: string | null;
    chaperoneId?: string | null;
    transporterId?: string | null;
  } | null;
  initialAvailabilityData?: any | null;
  initialError?: string | null;
  onSelectAppointment: (appointment: SelectedAppointment) => void;
  onBack?: () => void;
};
