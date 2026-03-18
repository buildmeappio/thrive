'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const removeSuperAdmin = async (organizationId: string, managerId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    // Note: removedByAccountId is not used in the service method, so we pass null
    const result = await organizationService.removeSuperAdmin(
      organizationId,
      managerId,
      null // removedByAccountId - not used in tenant context
    );

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Error removing superadmin:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_REMOVE_SUPERADMIN,
    };
  }
};

export default removeSuperAdmin;
