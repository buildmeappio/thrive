'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface UpdateLocationData {
  locationId: string;
  name?: string;
  addressJson?: Record<string, any>;
  timezone?: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

/**
 * Update a location
 */
const updateLocation = async (data: UpdateLocationData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { locationId, name, addressJson, timezone, regionTag, costCenterCode, isActive } = data;

    // Get the location
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new HttpError(404, 'Location not found');
    }

    // Verify location belongs to this organization
    if (location.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only update locations in your organization');
    }

    // If updating name, check for conflicts
    if (name && name.trim() !== location.name) {
      const normalizedName = name.trim();

      const existingLocation = await prisma.location.findFirst({
        where: {
          organizationId,
          name: normalizedName,
          deletedAt: null,
          id: { not: locationId },
        },
      });

      if (existingLocation) {
        throw new HttpError(400, 'Location with this name already exists');
      }
    }

    // Update location
    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: {
        ...(name && { name: name.trim() }),
        ...(addressJson && { addressJson }),
        ...(timezone !== undefined && { timezone: timezone || null }),
        ...(regionTag !== undefined && { regionTag: regionTag || null }),
        ...(costCenterCode !== undefined && { costCenterCode: costCenterCode || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return {
      success: true,
      data: updatedLocation,
    };
  } catch (error) {
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to update location',
    };
  }
};

export default updateLocation;
