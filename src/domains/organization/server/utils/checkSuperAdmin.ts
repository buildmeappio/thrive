'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';

/**
 * Checks if the current user is a SUPER_ADMIN for their organization
 * Returns the organizationManager record if valid, throws error otherwise
 */
export const checkSuperAdmin = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser?.organizationId || !currentUser?.accountId) {
    throw new HttpError(401, 'Unauthorized');
  }

  const organizationManager = await prisma.organizationManager.findFirst({
    where: {
      accountId: currentUser.accountId,
      organizationId: currentUser.organizationId,
      deletedAt: null,
    },
    include: {
      organizationRole: true,
    },
  });

  if (!organizationManager) {
    throw new HttpError(403, 'Organization manager not found');
  }

  const isSuperAdmin =
    organizationManager.organizationRole?.name === 'SUPER_ADMIN' &&
    organizationManager.organizationRole?.isSystemRole === true;

  if (!isSuperAdmin) {
    throw new HttpError(403, 'Only SUPER_ADMIN can perform this action');
  }

  return {
    organizationManager,
    organizationId: currentUser.organizationId,
  };
};
