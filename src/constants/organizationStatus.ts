export const OrganizationStatus = Object.freeze({
  ACCEPTED: 'accepted',
  PENDING: 'pending',
  REJECTED: 'rejected',
  NO_ACCESS: 'no_access',
} as const);

export type RoleType = (typeof OrganizationStatus)[keyof typeof OrganizationStatus];
