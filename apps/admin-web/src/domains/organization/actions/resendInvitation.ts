'use server';
import { getTenantContext } from './tenant-helpers';
import logger from '@/utils/logger';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';

const resendInvitation = async (invitationId: string) => {
  try {
    const { organizationService } = await getTenantContext();

    const invitation = await organizationService.resendInvitation(invitationId);

    return {
      success: true,
      invitation,
    };
  } catch (error) {
    logger.error('Error resending invitation:', error);
    return {
      success: false,
      error: ORGANIZATION_MESSAGES.ERROR.FAILED_TO_RESEND_INVITATION,
    };
  }
};

export default resendInvitation;
