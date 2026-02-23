'use server';

import prisma from '@/lib/db';
import { checkSuperAdminOrOrgAdmin } from '@/domains/organization/server/utils/checkSuperAdminOrOrgAdmin';
import { HttpError } from '@/utils/httpError';

/**
 * Soft delete a location
 */
const deleteLocation = async (locationId: string) => {
  try {
    const { organizationId } = await checkSuperAdminOrOrgAdmin();

    // Get the location
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new HttpError(404, 'Location not found');
    }

    // Verify location belongs to this organization
    if (location.organizationId !== organizationId) {
      throw new HttpError(403, 'You can only delete locations in your organization');
    }

    // Check if location is in use
    const locationInUse = await prisma.userLocationMembership.findFirst({
      where: {
        locationId,
      },
    });

    if (locationInUse) {
      throw new HttpError(
        400,
        'Location is assigned to users. Please remove all user assignments first.'
      );
    }

    // Soft delete
    await prisma.location.update({
      where: { id: locationId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return {
      success: true,
      message: 'Location deleted successfully',
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
      error: 'Failed to delete location',
    };
  }
};

export default deleteLocation;
