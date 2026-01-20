'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all roles (system and custom) for the organization
 */
const getRoles = async () => {
  const { organizationId } = await checkSuperAdmin();

  // Get system roles (seeded, global)
  const systemRoles = await prisma.organizationRole.findMany({
    where: {
      isSystemRole: true,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get custom roles for this organization
  const customRoles = await prisma.organizationRole.findMany({
    where: {
      organizationId,
      isSystemRole: false,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    success: true,
    data: {
      systemRoles,
      customRoles,
      allRoles: [...systemRoles, ...customRoles],
    },
  };
};

export default getRoles;
