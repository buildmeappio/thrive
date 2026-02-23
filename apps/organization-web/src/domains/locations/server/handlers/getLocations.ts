'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all locations for the organization
 */
const getLocations = async () => {
  const { organizationId } = await checkSuperAdmin();

  const locations = await prisma.location.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    success: true,
    data: locations,
  };
};

export default getLocations;
