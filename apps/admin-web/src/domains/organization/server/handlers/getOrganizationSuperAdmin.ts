'use server';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function getOrganizationSuperAdmin(organizationId: string) {
  try {
    const superAdmin = await OrganizationsService.getOrganizationSuperAdmin(organizationId);
    return superAdmin;
  } catch (error) {
    logger.error('Error getting organization superadmin:', error);
    throw error;
  }
}
