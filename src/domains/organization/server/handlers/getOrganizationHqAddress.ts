'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import type { AddressFormData } from '@/components/AddressForm';

/**
 * Get organization HQ address for the current user's organization
 */
const getOrganizationHqAddress = async (): Promise<AddressFormData | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: currentUser.organizationId,
        deletedAt: null,
      },
      select: {
        hqAddressJson: true,
      },
    });

    if (!organization) {
      return null;
    }

    // Transform hqAddressJson to AddressFormData format
    const hqAddress = organization.hqAddressJson as any;
    if (!hqAddress || typeof hqAddress !== 'object') {
      return null;
    }

    // Map to AddressFormData structure
    return {
      line1: hqAddress.line1 || '',
      line2: hqAddress.line2 || '',
      city: hqAddress.city || '',
      state: hqAddress.state || '',
      postalCode: hqAddress.postalCode || '',
      country: hqAddress.country || 'CA',
      county: hqAddress.county || '',
      latitude: hqAddress.latitude,
      longitude: hqAddress.longitude,
    };
  } catch (error) {
    console.error('Error fetching organization HQ address:', error);
    return null;
  }
};

export default getOrganizationHqAddress;
