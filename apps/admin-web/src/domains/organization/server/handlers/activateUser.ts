'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function activateUser(managerId: string, prisma: PrismaClient) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const manager = await service.activateUser(managerId);
    return manager;
  } catch (error) {
    logger.error('Error activating user:', error);
    throw error;
  }
}
