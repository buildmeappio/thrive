'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const deactivateUser = async (managerId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const result = await organizationService.deactivateUser(managerId);

    return {
      success: true,
      managerId: result.id,
    };
  } catch (error) {
    logger.error('Error deactivating user:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DEACTIVATE_USER,
    };
  }
};

export default deactivateUser;
