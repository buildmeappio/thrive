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

    // Get system roles (seeded, global - available to all organizations)
    const systemRoles = await prisma.organizationRole.findMany({
      where: {
        isSystemRole: true,
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

    // Get custom roles for this organization
    const customRoles = await prisma.organizationRole.findMany({
      where: {
        organizationId: currentUser.organizationId,
        isSystemRole: false,
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

    // Combine system and custom roles
    return [...systemRoles, ...customRoles];
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to get organization roles');
  }
};

export default getOrganizationRoles;
