'use server';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function getInvitations(organizationId: string) {
  try {
    const invitations = await OrganizationsService.getOrganizationInvitations(organizationId);
    return invitations;
  } catch (error) {
    logger.error('Error getting invitations:', error);
    throw error;
  }
}
