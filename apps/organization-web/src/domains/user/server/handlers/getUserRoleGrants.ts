'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Get all role grants for a specific user
 */
const getUserRoleGrants = async (organizationManagerId: string) => {
  const { organizationId } = await checkSuperAdmin();

  // Verify user belongs to organization
  const manager = await prisma.organizationManager.findUnique({
    where: { id: organizationManagerId },
  });

  if (!manager) {
    throw new HttpError(404, 'User not found');
  }

  if (manager.organizationId !== organizationId) {
    throw new HttpError(403, 'You can only view grants for users in your organization');
  }

  // Get all grants
  const grants = await prisma.userRoleGrant.findMany({
    where: {
      organizationManagerId,
      organizationId,
    },
    include: {
      role: true,
      location: true,
      grantedBy: {
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    success: true,
    data: grants,
  };
};

export default getUserRoleGrants;
