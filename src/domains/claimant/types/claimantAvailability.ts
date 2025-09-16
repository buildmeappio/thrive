import type { ClaimantPreference, TimeBand } from '@prisma/client';

export interface TimeSlot {
  id: string;
  label: string;
}

export interface Appointment {
  date: string;
  time: string;
  timeLabel: string;
}

export interface ClaimantAvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  start: Date;
  end: Date;
  timeBand: TimeBand;
}

export interface ClaimantAvailabilityService {
  type: string;
  enabled: boolean;
  interpreter?: {
    languageId: string;
  };
  transport?: {
    pickupAddressId?: string;
    rawLookup?: string;
    notes?: string;
  };
}

export interface CreateClaimantAvailabilityData {
  caseId: string;
  claimantId: string;
  preference: ClaimantPreference;
  accessibilityNotes?: string;
  additionalNotes?: string;
  consentAck: boolean;
  slots: ClaimantAvailabilitySlot[];
  services: ClaimantAvailabilityService[];
}

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
