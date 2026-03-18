'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function deactivateUser(managerId: string, prisma: PrismaClient) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const manager = await service.deactivateUser(managerId);
    return manager;
  } catch (error) {
    logger.error('Error deactivating user:', error);
    throw error;
  }
}
