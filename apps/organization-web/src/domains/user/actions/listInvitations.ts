'use server';

import prisma from '@/lib/db';
import { getCurrentUser } from '@/domains/auth/server/session';
import { HttpError } from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export type InvitationRow = {
  id: string;
  email: string;
  roleName: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string | null;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt: Date | null;
};

const listInvitations = async (): Promise<InvitationRow[]> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId) {
      throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
    }

    const now = new Date();

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: currentUser.organizationId,
        deletedAt: null,
        acceptedAt: null, // Only pending invitations (not accepted)
        expiresAt: {
          gt: now, // Only non-expired invitations
        },
      },
      include: {
        organizationRole: {
          select: {
            name: true,
          },
        },
        invitedBy: {
          include: {
            account: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map(invitation => {
      const invitedBy = invitation.invitedBy?.account?.user
        ? `${invitation.invitedBy.account.user.firstName} ${invitation.invitedBy.account.user.lastName}`.trim() ||
          invitation.invitedBy.account.user.email
        : null;

      return {
        id: invitation.id,
        email: invitation.email,
        roleName: invitation.organizationRole.name,
        status: 'pending' as const, // All invitations are pending since we filter them
        invitedBy,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        acceptedAt: invitation.acceptedAt,
      };
    });
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to list invitations');
  }
};

export default listInvitations;
