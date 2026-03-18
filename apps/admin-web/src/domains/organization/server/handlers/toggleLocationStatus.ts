'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { ToggleLocationStatusParams } from '../../types';

export default async function toggleLocationStatus(
  params: ToggleLocationStatusParams,
  prisma: PrismaClient
) {
  try {
    const { locationId, organizationId } = params;

    // Verify location exists and belongs to organization
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!location) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    // Toggle status
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        isActive: !location.isActive,
      },
    });

    return {
      success: true,
      data: updatedLocation,
    };
  } catch (error) {
    logger.error('Error toggling location status:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION_STATUS);
  }
}
