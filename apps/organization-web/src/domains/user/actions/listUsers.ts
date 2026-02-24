'use server';

import userService from '../server/user.service';
import { UserTableRow } from '../types/UserData';
import { AccountStatus } from '@thrive/database';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export const listUsers = async (): Promise<UserTableRow[]> => {
  const user = await getCurrentUser();
  if (!user?.organizationId) {
    throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
  }

  const users = await userService.listOrganizationUsers(user.organizationId);
  return users.map(user => {
    const account = user.accounts[0];
    // Prefer organization role over base role, fallback to base role or 'N/A'
    const organizationRole = account?.managers[0]?.organizationRole?.name;
    const baseRole = account?.role?.name;
    const role = organizationRole || baseRole || 'N/A';

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      gender: user.gender,
      role,
      isActive: account?.status === AccountStatus.ACTIVE,
      mustResetPassword: user.mustResetPassword,
      createdAt: user.createdAt.toISOString(),
    };
  });
};

export default listUsers;
