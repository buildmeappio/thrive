export const OrganizationStatus = Object.freeze({
  ACCEPTED: 'accepted',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const);

export type RoleType = (typeof OrganizationStatus)[keyof typeof OrganizationStatus];
