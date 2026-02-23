'use server';

import prisma from '@/lib/db';
import { checkSuperAdminOrOrgAdmin } from '@/domains/organization/server/utils/checkSuperAdminOrOrgAdmin';
import { HttpError } from '@/utils/httpError';

interface CreateLocationData {
  name: string;
  addressJson: Record<string, any>;
  timezone: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

/**
 * Create a new location
 */
const createLocation = async (data: CreateLocationData) => {
  try {
    const { organizationId } = await checkSuperAdminOrOrgAdmin();

    const { name, addressJson, timezone, regionTag, costCenterCode, isActive = true } = data;

    if (!name || name.trim().length === 0) {
      throw new HttpError(400, 'Location name is required');
    }

    if (!timezone || timezone.trim().length === 0) {
      throw new HttpError(400, 'Timezone is required');
    }

    // Validate address JSON structure
    if (!addressJson || typeof addressJson !== 'object') {
      throw new HttpError(400, 'Address is required');
    }

    // Ensure required address fields exist
    if (
      !addressJson.line1 ||
      !addressJson.city ||
      !addressJson.state ||
      !addressJson.postalCode ||
      !addressJson.country
    ) {
      throw new HttpError(400, 'Address must include line1, city, state, postalCode, and country');
    }

    const normalizedName = name.trim();

    // Check if location name already exists for this organization
    const existingLocation = await prisma.location.findFirst({
      where: {
        organizationId,
        name: normalizedName,
        deletedAt: null,
      },
    });

    if (existingLocation) {
      throw new HttpError(400, 'Location with this name already exists');
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        organizationId,
        name: normalizedName,
        addressJson,
        timezone: timezone.trim(),
        regionTag: regionTag?.trim() || null,
        costCenterCode: costCenterCode?.trim() || null,
        isActive,
      },
    });

    return {
      success: true,
      data: location,
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
      error: 'Failed to create location',
    };
  }
};

export default createLocation;
