/**
 * User Status Constants
 * These constants represent the different statuses a user account can have
 */
export enum UserStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

/**
 * User Status Labels for display purposes
 */
export const UserStatusLabels: Record<UserStatus, string> = {
  [UserStatus.PENDING]: "Pending",
  [UserStatus.ACTIVE]: "Active",
  [UserStatus.INACTIVE]: "Inactive",
  [UserStatus.SUSPENDED]: "Suspended",
  [UserStatus.REJECTED]: "Rejected",
};
/**
 * Check if a user status is active
 */
export const isUserActive = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.ACTIVE;
};

/**
 * Check if a user status is pending
 */
export const isUserPending = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.PENDING;
};

/**
 * Check if a user status is suspended
 */
export const isUserSuspended = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.SUSPENDED;
};

/**
 * Check if a user status is rejected
 */
export const isUserRejected = (
  status: UserStatus | null | undefined,
): boolean => {
  return status === UserStatus.REJECTED;
};
