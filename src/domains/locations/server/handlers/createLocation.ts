'use server';

import prisma from '@/lib/db';
import { checkSuperAdmin } from '@/domains/organization/server/utils/checkSuperAdmin';
import { HttpError } from '@/utils/httpError';

interface CreateLocationData {
  name: string;
  addressJson: Record<string, any>;
  timezone?: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

/**
 * Create a new location
 */
const createLocation = async (data: CreateLocationData) => {
  try {
    const { organizationId } = await checkSuperAdmin();

    const { name, addressJson, timezone, regionTag, costCenterCode, isActive = true } = data;

    if (!name || name.trim().length === 0) {
      throw new HttpError(400, 'Location name is required');
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
        timezone: timezone || null,
        regionTag: regionTag || null,
        costCenterCode: costCenterCode || null,
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
