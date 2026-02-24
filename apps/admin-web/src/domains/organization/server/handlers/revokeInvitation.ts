'use server';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function revokeInvitation(invitationId: string) {
  try {
    const invitation = await OrganizationsService.revokeInvitation(invitationId);
    return invitation;
  } catch (error) {
    logger.error('Error revoking invitation:', error);
    throw error;
  }
}
