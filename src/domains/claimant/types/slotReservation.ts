/**
 * Slot Reservation Types
 * For DynamoDB-based temporary slot reservations
 */

/**
 * Timer status based on remaining time
 */
export type TimerStatus = 'active' | 'warning' | 'critical' | 'expired';

/**
 * Timer state returned by useSlotReservationTimer hook
 */
export type TimerState = {
  timeRemaining: number; // seconds
  formattedTime: string; // MM:SS format
  status: TimerStatus;
  isExpired: boolean;
  progress: number; // 0-100 percentage
};

/**
 * Props for SlotReservationTimer component
 */
export type SlotReservationTimerProps = {
  expiresAt: string; // ISO timestamp when reservation expires
  examinerProfileId: string; // ID of the examiner
  bookingTime: string; // ISO timestamp of the booking slot
  examinationId: string; // ID of the examination
  onExpire?: () => void; // Optional callback when timer expires
  showProgressBar?: boolean; // Show progress bar (default: true)
  className?: string; // Additional CSS classes
};

/**
 * Props for useSlotReservationTimer hook
 */
export type UseSlotReservationTimerProps = {
  expiresAt: string; // ISO timestamp when reservation expires
  onExpire?: () => void; // Callback when timer expires
  onWarning?: () => void; // Callback at 2 minutes remaining
  onCritical?: () => void; // Callback at 1 minute remaining
};

/**
 * Slot reservation data structure (matches DynamoDB schema)
 */
export type SlotReservation = {
  slotKey: string; // Format: "{examinerProfileId}#{bookingTime}"
  examinationId: string; // ID of the examination
  claimantId: string; // ID of the claimant
  examinerProfileId: string; // ID of the examiner
  bookingTime: string; // ISO 8601 format
  reservedAt: number; // Unix timestamp (seconds)
  expiresAt: number; // Unix timestamp (seconds) - for TTL
};

/**
 * Result from reservation operations
 */
export type ReservationResult = {
  success: boolean;
  message: string;
  expiresAt?: string; // ISO format
};

/**
 * Result from slot availability check
 */
export type SlotAvailabilityResult = {
  available: boolean;
  reservedBy?: string; // examinationId if reserved
};
