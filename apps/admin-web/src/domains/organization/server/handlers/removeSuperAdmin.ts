'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function removeSuperAdmin(
  organizationId: string,
  managerId: string,
  removedByAccountId: string,
  prisma: PrismaClient
) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const result = await service.removeSuperAdmin(organizationId, managerId, removedByAccountId);
    return result;
  } catch (error) {
    logger.error('Error removing superadmin:', error);
    throw error;
  }
}
