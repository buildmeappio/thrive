'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

interface UpdateOrganizationDetailsData {
  organizationId: string;
  organizationType?: string;
  organizationSize?: string;
  website?: string;
}

export default async function updateOrganizationDetails(
  data: UpdateOrganizationDetailsData,
  prisma: PrismaClient
) {
  try {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
        status: true,
        hqAddressJson: true,
      },
    });

    if (!organization) {
      throw new HttpError(404, ORGANIZATION_MESSAGES.ERROR.ORGANIZATION_NOT_FOUND);
    }

    // Check if org details are set (timezone is now part of HQ address, not org details)
    const hasOrgDetails = data.organizationType && data.organizationSize;
    const hqAddressJson = organization.hqAddressJson as {
      line1?: string;
      city?: string;
    } | null;
    const hasHqAddress =
      hqAddressJson &&
      typeof hqAddressJson === 'object' &&
      hqAddressJson !== null &&
      !Array.isArray(hqAddressJson) &&
      (hqAddressJson.line1 || hqAddressJson.city);

    // Update organization details
    const updated = await prisma.organization.update({
      where: { id: data.organizationId },
      data: {
        type: data.organizationType || null,
        size: data.organizationSize || null,
        website: data.website?.trim() || null,
        // Update status to ACCEPTED if both org details and HQ are set
        ...(hasOrgDetails &&
          hasHqAddress &&
          organization.status === 'PENDING' && {
            status: 'ACCEPTED',
            isAuthorized: true,
          }),
      },
    });

    logger.info('Organization details updated successfully', {
      organizationId: data.organizationId,
      statusUpdated: hasOrgDetails && hasHqAddress && organization.status === 'PENDING',
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    logger.error('Error updating organization details:', error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_UPDATE_ORGANIZATION);
  }
}
