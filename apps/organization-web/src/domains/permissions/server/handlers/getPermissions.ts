'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all permissions for the organization
 */
const getPermissions = async () => {
  const { organizationId } = await checkSuperAdmin();

  // Permissions are global, not organization-specific
  const permissions = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      key: 'asc',
    },
  });

  return {
    success: true,
    data: permissions,
  };
};

export default getPermissions;
