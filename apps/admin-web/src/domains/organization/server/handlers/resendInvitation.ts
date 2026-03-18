'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function resendInvitation(invitationId: string, prisma: PrismaClient) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const invitation = await service.resendInvitation(invitationId);
    return invitation;
  } catch (error) {
    logger.error('Error resending invitation:', error);
    throw error;
  }
}
