'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { GetOrganizationGroupsParams } from '../../types';

export default async function getOrganizationGroups(
  params: GetOrganizationGroupsParams,
  prisma: PrismaClient
) {
  try {
    const { organizationId, page = 1, pageSize = 10, search = '' } = params;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION);
    }

    const { noPagination = false } = params;
    const skip = noPagination ? 0 : (page - 1) * pageSize;
    const take = noPagination ? undefined : pageSize;

    // Build where clause
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    // Add search filter
    if (search.trim()) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }

    // Get total count for pagination
    const total = await prisma.group.count({ where });

    // Get paginated groups
    const groups = await prisma.group.findMany({
      where,
      skip,
      take,
      include: {
        groupLocations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        groupMembers: {
          include: {
            organizationManager: {
              include: {
                account: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
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

    const pageCount = noPagination ? 1 : Math.ceil(total / pageSize);

    return {
      success: true,
      data: groups,
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  } catch (error) {
    logger.error('Error getting organization groups:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_GROUPS);
  }
}
