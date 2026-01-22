'use server';

import prisma from '@/lib/db';
import { checkSuperAdminOrOrgAdmin } from '@/domains/organization/server/utils/checkSuperAdminOrOrgAdmin';
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
    const { organizationId } = await checkSuperAdminOrOrgAdmin();

    const { locationId, name, addressJson, timezone, regionTag, costCenterCode, isActive } = data;

    // Validate address JSON structure if provided
    if (
      addressJson &&
      (typeof addressJson !== 'object' ||
        !addressJson.line1 ||
        !addressJson.city ||
        !addressJson.state ||
        !addressJson.postalCode ||
        !addressJson.country)
    ) {
      throw new HttpError(400, 'Address must include line1, city, state, postalCode, and country');
    }

    // Validate timezone if provided
    if (timezone !== undefined && (!timezone || timezone.trim().length === 0)) {
      throw new HttpError(400, 'Timezone cannot be empty');
    }

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
        ...(timezone !== undefined && { timezone: timezone.trim() || null }),
        ...(regionTag !== undefined && { regionTag: regionTag?.trim() || null }),
        ...(costCenterCode !== undefined && { costCenterCode: costCenterCode?.trim() || null }),
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
