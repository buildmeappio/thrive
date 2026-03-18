'use server';

import { getTenantContext } from './tenant-helpers';
import updateOrganizationHqAddressHandler from '../server/handlers/updateOrganizationHqAddress';

const updateOrganizationHqAddress = async (data: {
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
}) => {
  try {
    const { prisma } = await getTenantContext();
    return await updateOrganizationHqAddressHandler(data, prisma);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update HQ address',
    };
  }
};

export default updateOrganizationHqAddress;
