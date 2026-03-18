'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';

const getOrganizationSuperAdmin = async (organizationId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const superAdmin = await organizationService.getOrganizationSuperAdmin(organizationId);
    return {
      success: true,
      superAdmin,
    };
  } catch (error) {
    logger.error('Error getting organization superadmin:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
        superAdmin: null,
      };
    }
    return {
      success: false,
      error: 'Failed to get organization superadmin',
      superAdmin: null,
    };
  }
};

export default getOrganizationSuperAdmin;
