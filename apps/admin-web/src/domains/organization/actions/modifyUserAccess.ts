'use server';
import { getTenantContext } from './tenant-helpers';
import handlers from '../server/handlers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const modifyUserAccess = async (data: {
  organizationId: string;
  userId: string;
  organizationRoleId?: string;
  groupIds?: string[];
  locationIds?: string[];
}) => {
  try {
    const { prisma } = await getTenantContext();

    const result = await handlers.modifyUserAccess(data, prisma);

    return result;
  } catch (error) {
    logger.error('Error modifying user access:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_USERS || 'Failed to modify user access',
    };
  }
};

export default modifyUserAccess;
