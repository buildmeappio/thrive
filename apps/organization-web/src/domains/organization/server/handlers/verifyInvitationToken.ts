'use server';
import { verifyOrganizationInvitationToken } from '@/lib/jwt';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import log from '@/utils/log';

const verifyInvitationToken = async (token: string) => {
  try {
    // Verify JWT token
    const decoded = verifyOrganizationInvitationToken(token);
    if (!decoded) {
      throw new HttpError(401, 'Invalid or expired invitation token');
    }

    // Fetch invitation from database
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: decoded.invitationId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        organizationRole: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found');
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== decoded.email.toLowerCase()) {
      throw new HttpError(401, 'Invitation email mismatch');
    }

    // Verify role from token matches invitation role
    if (invitation.organizationRoleId !== decoded.organizationRoleId) {
      throw new HttpError(401, 'Invitation role mismatch');
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      throw new HttpError(410, 'Invitation has expired');
    }

    // Check if invitation is already accepted
    if (invitation.acceptedAt) {
      throw new HttpError(409, 'Invitation has already been accepted');
    }

    // Check if invitation is deleted
    if (invitation.deletedAt) {
      throw new HttpError(410, 'Invitation has been cancelled');
    }

    return {
      success: true,
      data: {
        invitationId: invitation.id,
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        email: invitation.email,
        role: invitation.organizationRole?.name || 'Unknown',
        expiresAt: invitation.expiresAt,
      },
    };
  } catch (error) {
    log.error('Error verifying invitation token:', error);
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to verify invitation token',
    };
  }
};

export default verifyInvitationToken;
