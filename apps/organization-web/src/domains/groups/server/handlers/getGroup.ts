'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';

/**
 * Get a single group by ID
 */
const getGroup = async (groupId: string) => {
  const { organizationId } = await checkSuperAdmin();

  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
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
  });

  if (!group) {
    return {
      success: false,
      error: 'Group not found',
    };
  }

  return {
    success: true,
    data: group,
  };
};

export default getGroup;
