import { WeeklyHoursState, OverrideHoursState } from '@/components/availability';

export type InterpreterFormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languageIds: string[];
  weeklyHours: WeeklyHoursState;
  overrideHours: OverrideHoursState;
};

export type ErrorWithStatus = {
  message?: string;
  status?: number;
  code?: string;
};

export const isErrorWithMessage = (error: unknown): error is ErrorWithStatus => {
  if (!error || typeof error !== 'object') return false;
  return 'message' in error && typeof (error as Record<string, unknown>).message === 'string';
};
