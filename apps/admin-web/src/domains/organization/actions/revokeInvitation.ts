'use server';
import { getCurrentUser } from '@/domains/auth/server/session';
import { redirect } from 'next/navigation';
import handlers from '../server/handlers';
import logger from '@/utils/logger';

const revokeInvitation = async (invitationId: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const result = await handlers.revokeInvitation(invitationId);

    return {
      success: true,
      invitationId: result.id,
    };
  } catch (error) {
    logger.error('Error revoking invitation:', error);
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to revoke invitation',
    };
  }
};

export default revokeInvitation;
