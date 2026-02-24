'use server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import handlers from '../server/handlers';
import logger from '@/utils/logger';

const resendInvitation = async (invitationId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const invitation = await handlers.resendInvitation(invitationId);

    return {
      success: true,
      invitation,
    };
  } catch (error) {
    logger.error('Error resending invitation:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to resend invitation',
    };
  }
};

export default resendInvitation;
