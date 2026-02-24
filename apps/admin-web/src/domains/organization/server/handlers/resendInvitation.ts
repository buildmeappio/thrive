'use server';
import * as OrganizationsService from '../organizations.service';
import logger from '@/utils/logger';

export default async function resendInvitation(invitationId: string) {
  try {
    const invitation = await OrganizationsService.resendInvitation(invitationId);
    return invitation;
  } catch (error) {
    logger.error('Error resending invitation:', error);
    throw error;
  }
}
