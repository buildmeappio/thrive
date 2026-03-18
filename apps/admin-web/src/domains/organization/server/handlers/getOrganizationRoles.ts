'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { GetOrganizationRolesParams } from '../../types';

export default async function getOrganizationRoles(
  params: GetOrganizationRolesParams,
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
      where.OR = [
        {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          key: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.organizationRole.count({ where });

    // Get paginated roles
    const roles = await prisma.organizationRole.findMany({
      where,
      skip,
      take,
      include: {
        _count: {
          select: {
            managers: true,
            permissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const pageCount = noPagination ? 1 : Math.ceil(total / pageSize);

    return {
      success: true,
      data: roles,
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  } catch (error) {
    logger.error('Error getting organization roles:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ROLES);
  }
}
