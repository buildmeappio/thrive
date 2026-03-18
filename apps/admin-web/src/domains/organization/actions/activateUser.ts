'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const activateUser = async (managerId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const result = await organizationService.activateUser(managerId);

    return {
      success: true,
      managerId: result.id,
    };
  } catch (error) {
    logger.error('Error activating user:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_ACTIVATE_USER,
    };
  }
};

export default activateUser;
