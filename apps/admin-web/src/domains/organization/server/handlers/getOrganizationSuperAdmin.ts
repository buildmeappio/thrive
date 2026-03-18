'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function getOrganizationSuperAdmin(
  organizationId: string,
  prisma: PrismaClient
) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const superAdmin = await service.getOrganizationSuperAdmin(organizationId);
    return superAdmin;
  } catch (error) {
    logger.error('Error getting organization superadmin:', error);
    throw error;
  }
}
