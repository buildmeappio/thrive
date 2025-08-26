import { Roles, RoleType } from '@/constants/role';

type Session = {
  role: RoleType;
} | null;

export const getSession = async (): Promise<Session> => {
  return Promise.resolve(null);
  // return Promise.resolve({ role: Roles.MEDICAL_EXAMINER } as { role: RoleType });
};
