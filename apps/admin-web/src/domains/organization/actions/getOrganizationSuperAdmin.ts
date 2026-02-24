'use server';
import handlers from '../server/handlers';
import logger from '@/utils/logger';

const getOrganizationSuperAdmin = async (organizationId: string) => {
  try {
    const superAdmin = await handlers.getOrganizationSuperAdmin(organizationId);
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
