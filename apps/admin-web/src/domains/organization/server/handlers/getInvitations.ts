'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function getInvitations(organizationId: string, prisma: PrismaClient) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const invitations = await service.getOrganizationInvitations(organizationId);
    return invitations;
  } catch (error) {
    logger.error('Error getting invitations:', error);
    throw error;
  }
}
