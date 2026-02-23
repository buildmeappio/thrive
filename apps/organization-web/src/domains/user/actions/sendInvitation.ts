'use server';

import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { getCurrentUser } from '@/domains/auth/server/session';
import ErrorMessages from '@/constants/ErrorMessages';
import { signOrganizationInvitationToken } from '@/lib/jwt';
import emailService from '@/services/emailService';
import env from '@/config/env';

type SendInvitationInput = {
  email: string;
  organizationRoleId: string;
};

export const sendInvitation = async (
  data: SendInvitationInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser?.organizationId || !currentUser?.accountId) {
      throw new HttpError(401, ErrorMessages.UNAUTHORIZED);
    }

    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Check if user already has an account in this organization
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: existingUser.id,
          managers: {
            some: {
              organizationId: currentUser.organizationId,
              deletedAt: null,
            },
          },
        },
      });

      if (existingAccount) {
        return {
          success: false,
          error: 'User is already a member of this organization',
        };
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: currentUser.organizationId,
        email: normalizedEmail,
        deletedAt: null,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: 'An invitation has already been sent to this email',
      };
    }

    // Verify organization role exists
    // Role can be system role (organizationId = null) or custom role (organizationId = current org)
    const organizationRole = await prisma.organizationRole.findUnique({
      where: { id: data.organizationRoleId },
    });

    if (!organizationRole) {
      throw new HttpError(404, 'Organization role not found');
    }

    // Verify role is either system role or belongs to this organization
    if (
      !organizationRole.isSystemRole &&
      organizationRole.organizationId !== currentUser.organizationId
    ) {
      throw new HttpError(403, 'You can only invite users with roles from your organization');
    }

    // Get organization manager ID from account
    const organizationManager = await prisma.organizationManager.findFirst({
      where: {
        accountId: currentUser.accountId,
        organizationId: currentUser.organizationId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    // Create invitation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Generate a temporary token placeholder (will be replaced with real token)
    const tempToken = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: currentUser.organizationId,
        email: normalizedEmail,
        organizationRoleId: data.organizationRoleId,
        invitedByManagerId: organizationManager?.id || null,
        token: tempToken, // Temporary token, will be replaced
        expiresAt,
      },
    });

    // Sign token with the actual invitation ID
    const token = signOrganizationInvitationToken({
      organizationId: currentUser.organizationId,
      email: normalizedEmail,
      invitationId: invitation.id,
      organizationRoleId: data.organizationRoleId,
    });

    // Update invitation with real token
    await prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: { token },
    });

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
      select: { name: true },
    });

    // Send invitation email
    const invitationLink = `${env.NEXT_PUBLIC_APP_URL}/organization/register?token=${token}`;
    const emailResult = await emailService.sendEmail(
      `Invitation to join ${organization?.name || 'our organization'}`,
      'organization-invitation.html',
      {
        email: normalizedEmail,
        organizationName: organization?.name || 'our organization',
        invitationLink,
        roleName: organizationRole.name,
        CDN_URL: env.NEXT_PUBLIC_CDN_URL ?? '',
        year: new Date().getFullYear(),
      },
      normalizedEmail
    );

    if (!emailResult.success) {
      // Delete invitation if email fails
      await prisma.organizationInvitation.delete({
        where: { id: invitation.id },
      });
      throw new HttpError(500, 'Failed to send invitation email');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof HttpError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to send invitation',
    };
  }
};

export default sendInvitation;
