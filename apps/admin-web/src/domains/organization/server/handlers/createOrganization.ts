'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import { CreateOrganizationInput } from '../../types/CreateOrganization.types';
import logger from '@/utils/logger';

const createOrganization = async (data: CreateOrganizationInput, prisma: PrismaClient) => {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const organization = await service.createOrganization(data);
    return {
      success: true,
      organizationId: organization.id,
    };
  } catch (error) {
    logger.error('Error creating organization:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to create organization',
    };
  }
};

export default createOrganization;
