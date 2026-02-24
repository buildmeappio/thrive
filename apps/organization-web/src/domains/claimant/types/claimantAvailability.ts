import type { ClaimantPreference } from '@thrive/database';

// ClaimantBookingStatus from @thrive/database (@thrive/databasenerate)
export enum ClaimantBookingStatus {
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
  REQUEST_MORE_INFO = 'REQUEST_MORE_INFO',
}

export interface CreateClaimantBookingData {
  examinationId: string;
  claimantId: string;
  examinerProfileId: string;
  bookingTime: Date;
  preference: ClaimantPreference;
  accessibilityNotes?: string;
  consentAck: boolean;
  interpreterId?: string;
  chaperoneId?: string;
  transporterId?: string;
  status?: ClaimantBookingStatus;
}

export interface UpdateClaimantBookingStatusData {
  bookingId: string;
  status: ClaimantBookingStatus;
  notes?: string; // Optional notes when declining or requesting more info
}

export interface ClaimantBookingResponse {
  id: string;
  examinationId: string;
  claimantId: string;
  examinerProfileId: string;
  bookingTime: Date;
  preference: ClaimantPreference;
  accessibilityNotes?: string;
  consentAck: boolean;
  interpreterId?: string;
  chaperoneId?: string;
  transporterId?: string;
  status: ClaimantBookingStatus | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
