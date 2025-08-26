export const Roles = Object.freeze({
  MEDICAL_EXAMINER: 'medical_examiner',
  SUPER_ADMIN: 'super_admin',
  CLAIMANT: 'claimant',
  ORGANIZATION_MANAGER: 'organization-manager',
} as const);

export type RoleType = (typeof Roles)[keyof typeof Roles];
