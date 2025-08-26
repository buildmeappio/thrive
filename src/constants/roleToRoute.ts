import { Roles } from './role';

export const roleToRouteMap = {
  [Roles.SUPER_ADMIN]: 'admin',
  [Roles.MEDICAL_EXAMINER]: 'examiner',
  [Roles.ORGANIZATION_MANAGER]: 'organization',
  [Roles.CLAIMANT]: 'organization',
} as const;

export type RoleToRouteMap = (typeof roleToRouteMap)[keyof typeof roleToRouteMap];
export const allowedRoleRouteKeys = Object.values(roleToRouteMap) as RoleToRouteMap[];
