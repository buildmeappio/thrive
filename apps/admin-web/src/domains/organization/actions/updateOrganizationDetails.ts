'use server';

import { getTenantContext } from './tenant-helpers';
import updateOrganizationDetailsHandler from '../server/handlers/updateOrganizationDetails';

const updateOrganizationDetails = async (data: {
  organizationId: string;
  organizationType?: string;
  organizationSize?: string;
  website?: string;
}) => {
  try {
    const { prisma } = await getTenantContext();
    return await updateOrganizationDetailsHandler(data, prisma);
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to update organization details',
    };
  }
};

export default updateOrganizationDetails;
