'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';

/**
 * Checks if the current user is a SUPER_ADMIN or ORG_ADMIN for their organization
 * Returns the organizationManager record if valid, throws error otherwise
 */
export const checkSuperAdminOrOrgAdmin = async () => {
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

  const roleName = organizationManager.organizationRole?.name;
  const isSystemRole = organizationManager.organizationRole?.isSystemRole;

  // Check if user is SUPER_ADMIN (system role) or ORG_ADMIN (custom organization role)
  const isSuperAdmin = roleName === 'SUPER_ADMIN' && isSystemRole === true;
  const isOrgAdmin = roleName === 'ORG_ADMIN';

  if (!isSuperAdmin && !isOrgAdmin) {
    throw new HttpError(403, 'Only SUPER_ADMIN or ORG_ADMIN can perform this action');
  }

  return {
    organizationManager,
    organizationId: currentUser.organizationId,
  };
};
