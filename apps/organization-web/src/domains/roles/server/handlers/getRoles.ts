'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all roles (system and custom) for the organization
 */
const getRoles = async () => {
  const { organizationId } = await checkSuperAdmin();

  // isSystemRole field removed from OrganizationRole model
  // Get all roles for this organization
  const allRoles = await prisma.organizationRole.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // For backward compatibility, split into systemRoles and customRoles
  // Since isSystemRole doesn't exist, we'll treat all as custom roles
  const systemRoles: typeof allRoles = [];
  const customRoles = allRoles;

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
