'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const revokeInvitation = async (invitationId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const result = await organizationService.revokeInvitation(invitationId);

    return {
      success: true,
      invitationId: result.id,
    };
  } catch (error) {
    logger.error('Error revoking invitation:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_REVOKE_INVITATION,
    };
  }
};

export default revokeInvitation;
