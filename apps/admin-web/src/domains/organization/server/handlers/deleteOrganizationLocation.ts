'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { DeleteLocationParams } from '../../types';

export default async function deleteOrganizationLocation(
  params: DeleteLocationParams,
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

    // Soft delete location
    await prisma.location.update({
      where: { id: locationId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error deleting organization location:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DELETE_LOCATION);
  }
}
