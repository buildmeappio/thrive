'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';

const getInvitations = async (organizationId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const invitations = await organizationService.getOrganizationInvitations(organizationId);
    return {
      success: true,
      invitations,
    };
  } catch (error) {
    logger.error('Error getting invitations:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        invitations: [],
      };
    }
    return {
      success: false,
      error: 'Failed to get invitations',
      invitations: [],
    };
  }
};

export default getInvitations;
