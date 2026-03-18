'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function revokeInvitation(invitationId: string, prisma: PrismaClient) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const invitation = await service.revokeInvitation(invitationId);
    return invitation;
  } catch (error) {
    logger.error('Error revoking invitation:', error);
    throw error;
  }
}
