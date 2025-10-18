import { Roles, RoleType } from "@/domains/auth/constants/roles";

export const ALLOWED_ROLES = new Set<RoleType>([
  Roles.SUPER_ADMIN,
  Roles.ADMIN,
  Roles.STAFF
]);


export const isAllowedRole = (role?: string): role is RoleType =>
  !!role && ALLOWED_ROLES.has(role as RoleType);
