'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

export default async function getSystemPermissions(prisma: PrismaClient) {
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        key: true,
        description: true,
        createdAt: true,
      },
      orderBy: {
        key: 'asc',
      },
    });

    return {
      success: true,
      data: permissions,
    };
  } catch (error) {
    logger.error('Error getting system permissions:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_PERMISSIONS);
  }
}
