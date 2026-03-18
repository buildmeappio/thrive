'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { GetOrganizationLocationsParams } from '../../types';

export default async function getOrganizationLocations(
  params: GetOrganizationLocationsParams,
  prisma: PrismaClient
) {
  try {
    const {
      organizationId,
      page = 1,
      pageSize = 10,
      search = '',
      status = 'all',
      noPagination = false,
    } = params;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION);
    }

    const skip = noPagination ? 0 : (page - 1) * pageSize;
    const take = noPagination ? undefined : pageSize;

    // Build where clause
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    // Add status filter
    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

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
          timezone: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prisma.location.count({ where });

    // Get paginated locations
    const locations = await prisma.location.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        addressJson: true,
        timezone: true,
        regionTag: true,
        costCenterCode: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const pageCount = noPagination ? 1 : Math.ceil(total / pageSize);

    return {
      success: true,
      data: locations,
      pagination: {
        page,
        pageSize,
        total,
        pageCount,
      },
    };
  } catch (error) {
    logger.error('Error getting organization locations:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_LOCATIONS);
  }
}
