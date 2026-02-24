'use server';
import handlers from '../server/handlers';
import logger from '@/utils/logger';

const getInvitations = async (organizationId: string) => {
  try {
    const invitations = await handlers.getInvitations(organizationId);
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
