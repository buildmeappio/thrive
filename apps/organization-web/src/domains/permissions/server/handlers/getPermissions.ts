'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all permissions for the organization
 */
const getPermissions = async () => {
  const { organizationId } = await checkSuperAdmin();

  const permissions = await prisma.permission.findMany({
    where: {
      organizationId,
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
