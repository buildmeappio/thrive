'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { locationSchema } from '../../schemas/locationSchema';
import { ORGANIZATION_MESSAGES, APP_MESSAGES } from '@/constants/messages';

interface UpdateHqAddressData {
  organizationId: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    county?: string;
    latitude?: number;
    longitude?: number;
  };
  timezone?: string;
}

export default async function updateOrganizationHqAddress(
  data: UpdateHqAddressData,
  prisma: PrismaClient
) {
  try {
    // Verify organization exists first
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        timezone: true,
      },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.ORGANIZATION_NOT_FOUND);
    }

    // Validate input - use location schema for address validation
    // Use timezone from data if provided, otherwise use organization's timezone
    const timezoneToUse = data.timezone || organization.timezone || 'America/Toronto';
    const validated = locationSchema.parse({
      name: 'Headquarters', // HQ location name is fixed
      address: data.address,
      timezone: timezoneToUse,
      regionTag: '',
      costCenterCode: '',
      isActive: true,
    });

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async tx => {
      // Step 1: Update organization hqAddressJson
      await tx.organization.update({
        where: { id: data.organizationId },
        data: {
          hqAddressJson: validated.address,
          // Update status to ACCEPTED if it was PENDING
          ...(organization.status === 'PENDING' && {
            status: 'ACCEPTED',
            isAuthorized: true,
          }),
        },
      });

      // Step 2: Find or create Headquarters location
      const hqLocationName = 'Headquarters';
      let hqLocation = await tx.location.findFirst({
        where: {
          organizationId: data.organizationId,
          name: hqLocationName,
          deletedAt: null,
        },
      });

      if (hqLocation) {
        // Update existing HQ location
        // Use timezone from form if provided, otherwise use organization's timezone
        hqLocation = await tx.location.update({
          where: { id: hqLocation.id },
          data: {
            addressJson: validated.address,
            timezone: timezoneToUse,
            isActive: true,
          },
        });
      } else {
        // Create new HQ location
        // Use timezone from form if provided, otherwise use organization's timezone
        hqLocation = await tx.location.create({
          data: {
            organizationId: data.organizationId,
            name: hqLocationName,
            addressJson: validated.address,
            timezone: timezoneToUse,
            isActive: true,
          },
        });
      }

      return {
        organization: {
          id: data.organizationId,
          status: organization.status === 'PENDING' ? 'ACCEPTED' : organization.status,
        },
        location: hqLocation,
      };
    });

    logger.info('Organization HQ address updated successfully', {
      organizationId: data.organizationId,
      statusUpdated: organization.status === 'PENDING',
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error('Error updating organization HQ address:', error);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'ZodError') {
      throw new HttpError(400, APP_MESSAGES.ERROR.DATABASE.VALIDATION_ERROR);
    }
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_HQ_ADDRESS);
  }
}
