'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

const checkOrganizationNameExists = async (name: string, prisma: PrismaClient) => {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const exists = await service.checkOrganizationNameExists(name);
    return { exists };
  } catch (error) {
    logger.error('Error checking organization name:', error);
    throw error;
  }
};

export default checkOrganizationNameExists;
