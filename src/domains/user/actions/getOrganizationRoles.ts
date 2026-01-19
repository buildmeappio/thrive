'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export const getOrganizationRoles = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
    }

    const roles = await prisma.organizationRole.findMany({
      where: {
        organizationId: currentUser.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return roles;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization roles');
  }
};

export default getOrganizationRoles;
