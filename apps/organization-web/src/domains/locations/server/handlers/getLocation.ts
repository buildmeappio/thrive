'use server';

import prisma from '@/lib/db';
import { checkSuperAdminOrOrgAdmin } from '@/domains/organization/server/utils/checkSuperAdminOrOrgAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Get a single location by ID
 */
const getLocation = async (locationId: string) => {
  try {
    const { organizationId } = await checkSuperAdminOrOrgAdmin();

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
        deletedAt: null,
      },
    });

    if (!location) {
      throw new HttpError(404, 'Location not found');
    }

    // Verify location belongs to this organization
    if (location.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only view locations in your organization');
    }

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
      error: 'Failed to get location',
    };
  }
};

export default getLocation;
