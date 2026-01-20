'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';

/**
 * Check if current user is SUPER_ADMIN
 * Returns true/false (doesn't throw error)
 * Client-safe version for use in client components
 */
export const checkIsSuperAdmin = async (): Promise<boolean> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId || !currentUser?.accountId) {
      return false;
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

    if (!organizationManager?.organizationRole) {
      return false;
    }

    return (
      organizationManager.organizationRole.name === 'SUPER_ADMIN' &&
      organizationManager.organizationRole.isSystemRole === true
    );
  } catch {
    return false;
  }
};
