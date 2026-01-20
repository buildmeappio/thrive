'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get all groups for the organization
 */
const getGroups = async () => {
  const { organizationId } = await checkSuperAdmin();

  const groups = await prisma.group.findMany({
    where: {
      organizationId,
      deletedAt: null,
    },
    include: {
      role: true,
      groupLocations: {
        include: {
          location: true,
        },
      },
      groupMembers: {
        include: {
          organizationManager: {
            include: {
              account: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return {
    success: true,
    data: groups,
  };
};

export default getGroups;
