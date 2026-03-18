'use server';
import { PrismaClient } from '@thrive/database';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function inviteSuperAdmin(
  organizationId: string,
  email: string,
  firstName: string,
  lastName: string,
  invitedByAccountId: string,
  prisma: PrismaClient,
  organizationRoleId?: string
) {
  try {
    const service = OrganizationsService.createTenantOrganizationService(prisma);
    const invitation = await service.inviteSuperAdmin(
      organizationId,
      email,
      firstName,
      lastName,
      invitedByAccountId,
      organizationRoleId
    );
    return invitation;
  } catch (error) {
    logger.error('Error inviting superadmin:', error);
    throw error;
  }
}
