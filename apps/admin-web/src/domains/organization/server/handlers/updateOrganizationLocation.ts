'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { locationSchema } from '../../schemas/locationSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { UpdateLocationData } from '../../types';

export default async function updateOrganizationLocation(
  data: UpdateLocationData,
  prisma: PrismaClient
) {
  try {
    // Validate input
    const validated = locationSchema.parse({
      name: data.name,
      address: data.address,
      timezone: data.timezone,
      regionTag: data.regionTag || '',
      costCenterCode: data.costCenterCode || '',
      isActive: data.isActive ?? true,
    });

    // Verify location exists and belongs to organization
    const existingLocation = await prisma.location.findFirst({
      where: {
        id: data.locationId,
        organizationId: data.organizationId,
        deletedAt: null,
      },
    });

    if (!existingLocation) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.LOCATION_NOT_FOUND);
    }

    // Check if another location with the same name exists (excluding current location)
    const duplicateLocation = await prisma.location.findFirst({
      where: {
        organizationId: data.organizationId,
        name: validated.name.trim(),
        id: { not: data.locationId },
        deletedAt: null,
      },
    });

    if (duplicateLocation) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.LOCATION_NAME_EXISTS);
    }

    // Update location
    const location = await prisma.location.update({
      where: { id: data.locationId },
      data: {
        name: validated.name.trim(),
        addressJson: validated.address,
        timezone: validated.timezone,
        regionTag: validated.regionTag || null,
        costCenterCode: validated.costCenterCode || null,
        isActive: validated.isActive,
      },
    });

    return {
      success: true,
      data: location,
    };
  } catch (error) {
    logger.error('Error updating organization location:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_LOCATION);
  }
}
