/**
 * UserStatus enum and utilities
 *
 * This represents the status of a User account - only used for examiners after password creation.
 * For examiner workflow statuses (SUBMITTED, REJECTED, etc.), use ExaminerStatus on ExaminerProfile.
 *
 * NOTE: REJECTED exists in the enum for database compatibility but should NOT be used.
 * Rejection is part of the ExaminerStatus workflow, not User account status.
 */

export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED", // Database compatibility only - DO NOT USE in code
}

/**
 * User-friendly labels for UserStatus values
 */
export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.PENDING]: "Pending",
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.SUSPENDED]: "Suspended",
  [UserStatus.REJECTED]: "Rejected", // Not used for User.status
};

/**
 * Helper functions to check UserStatus
 */
export const isUserActive = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.ACTIVE;
};

export const isUserPending = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.PENDING;
};

export const isUserSuspended = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.SUSPENDED;
};

export const isUserInactive = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.INACTIVE;
};
