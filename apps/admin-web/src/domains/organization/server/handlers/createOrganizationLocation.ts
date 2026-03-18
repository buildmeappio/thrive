'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { locationSchema } from '../../schemas/locationSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';
import { CreateLocationData } from '../../types';

export default async function createOrganizationLocation(
  data: CreateLocationData,
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

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: data.organizationId },
      select: { id: true },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION);
    }

    // Check if location name already exists for this organization
    const existingLocation = await prisma.location.findFirst({
      where: {
        organizationId: data.organizationId,
        name: validated.name.trim(),
        deletedAt: null,
      },
    });

    if (existingLocation) {
      throw new HttpError(409, ORGANIZATION_MESSAGES.ERROR.LOCATION_NAME_EXISTS);
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        organizationId: data.organizationId,
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
    logger.error('Error creating organization location:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_LOCATION);
  }
}
