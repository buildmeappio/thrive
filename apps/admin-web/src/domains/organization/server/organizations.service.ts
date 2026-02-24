'use server';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { signOrganizationInvitationToken, verifyOrganizationInvitationToken } from '@/lib/jwt';
import emailService from '@/services/email.service';
import { ENV } from '@/constants/variables';

export async function listOrganizations() {
  try {
    return await prisma.organization.findMany({
      include: {
        address: true,
        manager: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation time, newest first
      },
    });
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, 'Failed to list organizations', {
      details: error,
    });
  }
}

export async function getOrganizationById(id: string) {
  try {
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        address: true,
        manager: {
          where: {
            deletedAt: null,
            account: {
              user: {
                userType: 'ORGANIZATION_USER',
                organizationId: { not: null },
              },
            },
          },
          include: {
            account: {
              include: {
                user: true,
              },
            },
            department: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, 'Failed to get organization', { details: error });
  }
}

export async function listOrganizationTypes() {
  try {
    return await prisma.organizationType.findMany();
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, 'Failed to list organization types', {
      details: error,
    });
  }
}

export async function checkOrganizationNameExists(name: string): Promise<boolean> {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return false;
    }

    // Find all organizations with similar names (case-insensitive)
    const organizations = await prisma.organization.findMany({
      where: {
        name: {
          contains: trimmedName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Check for exact match (case-insensitive)
    const exactMatch = organizations.some(
      org => org.name.toLowerCase() === trimmedName.toLowerCase()
    );

    return exactMatch;
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, 'Failed to check organization name', {
      details: error,
    });
  }
}

export async function createOrganization(data: {
  firstName: string;
  lastName: string;
  organizationName: string;
  email: string;
}) {
  try {
    // Create organization and SUPER_ADMIN role in a transaction
    const result = await prisma.$transaction(async tx => {
      // Create organization (not authorized until superadmin accepts invitation)
      // type and addressId are now optional, so we don't need to create them
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName.trim(),
          website: null,
          isAuthorized: false,
          status: 'PENDING',
          type: null, // Can be set later
          addressId: null, // Can be set later
        },
        include: {
          address: true,
        },
      });

      // Create SUPER_ADMIN role for this organization
      const superAdminRole = await tx.organizationRole.create({
        data: {
          name: 'Super Admin',
          key: 'SUPER_ADMIN',
          organizationId: organization.id,
          description: 'Super Administrator role for the organization',
        },
      });

      // Create invitation for the superadmin
      const expiryString = process.env.JWT_ORGANIZATION_INVITATION_TOKEN_EXPIRY || '7d';
      let expiresInDays = 7;
      if (expiryString.endsWith('d')) {
        expiresInDays = parseInt(expiryString.slice(0, -1)) || 7;
      } else if (expiryString.endsWith('h')) {
        expiresInDays = Math.ceil(parseInt(expiryString.slice(0, -1)) || 168) / 24;
      } else {
        expiresInDays = parseInt(expiryString) || 7;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Create invitation record
      const invitation = await tx.organizationInvitation.create({
        data: {
          organizationId: organization.id,
          email: data.email.toLowerCase().trim(),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          organizationRoleId: superAdminRole.id,
          invitedByManagerId: null, // Admin user inviting
          token: '', // Will be updated
          expiresAt,
        },
      });

      // Generate JWT token
      const token = signOrganizationInvitationToken({
        organizationId: organization.id,
        email: data.email.toLowerCase().trim(),
        invitationId: invitation.id,
        organizationRoleId: superAdminRole.id,
      });

      // Update invitation with token
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { token },
      });

      return { organization, invitation, superAdminRole };
    });

    // Send invitation email
    try {
      const invitationLink = `${ENV.NEXT_PUBLIC_APP_URL || ''}/organization/register?token=${result.invitation.token}`;
      const expiresAtFormatted = result.invitation.expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const fullName =
        `${data.firstName?.trim() || ''} ${data.lastName?.trim() || ''}`.trim() || 'there';

      await emailService.sendEmail(
        `Superadmin Invitation - ${result.organization.name}`,
        'organization-superadmin-invite.html',
        {
          name: fullName,
          organizationName: result.organization.name,
          email: result.invitation.email,
          invitationLink,
          expiresAt: expiresAtFormatted,
          year: new Date().getFullYear(),
        },
        result.invitation.email
      );
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
    }

    return result.organization;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to create organization', {
      details: error,
    });
  }
}

// Helper function to get or create the SUPER_ADMIN role for an organization
export async function getOrCreateSuperAdminRole(organizationId: string) {
  try {
    // Try to find existing SUPER_ADMIN role for this organization
    let superAdminRole = await prisma.organizationRole.findFirst({
      where: {
        key: 'SUPER_ADMIN',
        organizationId,
        deletedAt: null,
      },
    });

    // If it doesn't exist, create it
    if (!superAdminRole) {
      superAdminRole = await prisma.organizationRole.create({
        data: {
          name: 'Super Admin',
          key: 'SUPER_ADMIN',
          organizationId,
          description: 'Super Administrator role for the organization',
        },
      });
    }

    return superAdminRole;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to get or create SUPER_ADMIN role', {
      details: error,
    });
  }
}

/**
 * Invite a superadmin to an organization
 */
export async function inviteSuperAdmin(
  organizationId: string,
  email: string,
  firstName: string,
  lastName: string,
  invitedByAccountId: string
) {
  try {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    if (!organization) {
      throw new HttpError(404, 'Organization not found');
    }

    // Get or create the SUPER_ADMIN role for this organization
    const superAdminRole = await getOrCreateSuperAdminRole(organizationId);

    // Check if there's already a pending or accepted invitation for this email
    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId,
        email: email.toLowerCase().trim(),
        organizationRoleId: superAdminRole.id,
        deletedAt: null,
      },
    });

    // If there's already a pending invitation for the same email, resend it instead
    if (existingInvitation && !existingInvitation.acceptedAt) {
      // Check if invitation is expired
      if (new Date() > existingInvitation.expiresAt) {
        // Expired invitation - create a new one
        // Continue with normal flow (will be handled below)
      } else {
        // Valid pending invitation - resend it
        try {
          await emailService.sendEmail(
            `Superadmin Invitation - ${organization.name}`,
            'organization-superadmin-invite.html',
            {
              organizationName: organization.name,
              email: existingInvitation.email,
              invitationLink: `${ENV.NEXT_PUBLIC_APP_URL || ''}/organization/register?token=${existingInvitation.token}`,
              expiresAt: existingInvitation.expiresAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              year: new Date().getFullYear(),
            },
            existingInvitation.email
          );

          // Return the existing invitation
          return await prisma.organizationInvitation.findUnique({
            where: { id: existingInvitation.id },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
              organizationRole: true,
            },
          });
        } catch (emailError) {
          logger.error('Failed to resend invitation email:', emailError);
          // If email fails, still return the invitation
          return await prisma.organizationInvitation.findUnique({
            where: { id: existingInvitation.id },
            include: {
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
              organizationRole: true,
            },
          });
        }
      }
    }

    // Note: Multiple superadmins are now allowed per organization

    // Create invitation in a transaction
    const result = await prisma.$transaction(async tx => {
      // Expire all previous pending invitations for this organization (different emails)
      await tx.organizationInvitation.updateMany({
        where: {
          organizationId,
          organizationRoleId: superAdminRole.id,
          email: { not: email.toLowerCase().trim() },
          acceptedAt: null,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // Calculate expiration date (7 days from now by default, or from env var)
      // Parse expiry string like "7d" to get number of days
      const expiryString = process.env.JWT_ORGANIZATION_INVITATION_TOKEN_EXPIRY || '7d';
      let expiresInDays = 7; // Default

      if (expiryString.endsWith('d')) {
        expiresInDays = parseInt(expiryString.slice(0, -1)) || 7;
      } else if (expiryString.endsWith('h')) {
        expiresInDays = Math.ceil(parseInt(expiryString.slice(0, -1)) || 168) / 24; // Convert hours to days
      } else {
        expiresInDays = parseInt(expiryString) || 7;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Find the OrganizationManager for the account (if exists)
      // This will be null if the inviter is an admin user (not an organization manager)
      const inviterManager = await tx.organizationManager.findFirst({
        where: {
          accountId: invitedByAccountId,
          organizationId,
          deletedAt: null,
        },
        select: { id: true },
      });

      // Create invitation record first (without token)
      const invitation = await tx.organizationInvitation.create({
        data: {
          organizationId,
          email: email.toLowerCase().trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          organizationRoleId: superAdminRole.id,
          invitedByManagerId: inviterManager?.id || null,
          token: '', // Temporary, will be updated
          expiresAt,
        },
      });

      // Generate JWT token with invitation details (including role)
      const token = signOrganizationInvitationToken({
        organizationId,
        email: email.toLowerCase().trim(),
        invitationId: invitation.id,
        organizationRoleId: superAdminRole.id,
      });

      // Update invitation with the token
      const updatedInvitation = await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { token },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          organizationRole: true,
        },
      });

      return updatedInvitation;
    });

    // Send invitation email
    try {
      const invitationLink = `${ENV.NEXT_PUBLIC_APP_URL || ''}/organization/register?token=${result.token}`;
      const expiresAtFormatted = result.expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim() || 'there';

      await emailService.sendEmail(
        `Superadmin Invitation - ${result.organization.name}`,
        'organization-superadmin-invite.html',
        {
          name: fullName,
          organizationName: result.organization.name,
          email: result.email,
          invitationLink,
          expiresAt: expiresAtFormatted,
          year: new Date().getFullYear(),
        },
        result.email
      );
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation creation if email fails
    }

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to invite superadmin', {
      details: error,
    });
  }
}

/**
 * Resend an invitation email
 * Deletes the previous invitation and creates a new one
 */
export async function resendInvitation(invitationId: string) {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        organizationRole: true,
      },
    });

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found');
    }

    if (invitation.deletedAt) {
      throw new HttpError(410, 'Invitation has been cancelled');
    }

    if (invitation.acceptedAt) {
      throw new HttpError(409, 'Invitation has already been accepted');
    }

    // organizationRoleId is required in the schema, so it should always be present
    const organizationRoleId = invitation.organizationRoleId;
    if (!organizationRoleId) {
      throw new HttpError(400, 'Invitation is missing organization role');
    }

    // Calculate expiration date (7 days from now by default, or from env var)
    const expiryString = process.env.JWT_ORGANIZATION_INVITATION_TOKEN_EXPIRY || '7d';
    let expiresInDays = 7; // Default

    if (expiryString.endsWith('d')) {
      expiresInDays = parseInt(expiryString.slice(0, -1)) || 7;
    } else if (expiryString.endsWith('h')) {
      expiresInDays = Math.ceil(parseInt(expiryString.slice(0, -1)) || 168) / 24; // Convert hours to days
    } else {
      expiresInDays = parseInt(expiryString) || 7;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Delete previous invitation and create new one in a transaction
    const newInvitation = await prisma.$transaction(async tx => {
      // Hard delete the previous invitation to avoid unique constraint violation
      await tx.organizationInvitation.delete({
        where: { id: invitationId },
      });

      // Create new invitation record
      const newInvitationRecord = await tx.organizationInvitation.create({
        data: {
          organizationId: invitation.organizationId,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          organizationRoleId: organizationRoleId,
          invitedByManagerId: invitation.invitedByManagerId,
          token: '', // Temporary, will be updated
          expiresAt,
        },
      });

      // Generate JWT token with invitation details (including role)
      const newToken = signOrganizationInvitationToken({
        organizationId: invitation.organizationId,
        email: invitation.email,
        invitationId: newInvitationRecord.id,
        organizationRoleId: organizationRoleId,
      });

      // Update invitation with the token
      const updatedInvitation = await tx.organizationInvitation.update({
        where: { id: newInvitationRecord.id },
        data: { token: newToken },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          organizationRole: true,
        },
      });

      return updatedInvitation;
    });

    // Send invitation email with new token
    const invitationLink = `${ENV.NEXT_PUBLIC_APP_URL || ''}/organization/register?token=${newInvitation.token}`;
    const expiresAtFormatted = newInvitation.expiresAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const fullName =
      newInvitation.firstName && newInvitation.lastName
        ? `${newInvitation.firstName.trim()} ${newInvitation.lastName.trim()}`.trim()
        : newInvitation.firstName?.trim() || newInvitation.lastName?.trim() || 'there';

    const emailResult = await emailService.sendEmail(
      `Superadmin Invitation - ${newInvitation.organization.name}`,
      'organization-superadmin-invite.html',
      {
        name: fullName,
        organizationName: newInvitation.organization.name,
        email: newInvitation.email,
        invitationLink,
        expiresAt: expiresAtFormatted,
        year: new Date().getFullYear(),
      },
      newInvitation.email
    );

    if (!emailResult.success) {
      const errorMsg = 'error' in emailResult ? emailResult.error : 'Unknown error';
      throw new HttpError(500, `Failed to send email: ${errorMsg}`);
    }

    return newInvitation;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to resend invitation', {
      details: error,
    });
  }
}

/**
 * Get all invitations for an organization
 */
export async function getOrganizationInvitations(organizationId: string) {
  try {
    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        organizationRole: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations;
  } catch (error) {
    logger.error(error);
    throw new HttpError(500, 'Failed to get organization invitations', {
      details: error,
    });
  }
}

/**
 * Get the current superadmin for an organization
 */
export async function getOrganizationSuperAdmin(organizationId: string) {
  try {
    // Get or create the SUPER_ADMIN role for this organization
    const superAdminRole = await getOrCreateSuperAdminRole(organizationId);

    // Find the superadmin manager
    const superAdmin = await prisma.organizationManager.findFirst({
      where: {
        organizationId,
        organizationRoleId: superAdminRole.id,
        deletedAt: null,
        account: {
          user: {
            userType: 'ORGANIZATION_USER',
            organizationId: { not: null },
          },
        },
      },
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        organizationRole: true,
        department: true,
      },
    });

    return superAdmin;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to get organization superadmin', {
      details: error,
    });
  }
}

/**
 * Remove a superadmin from an organization
 */
export async function removeSuperAdmin(
  organizationId: string,
  managerId: string,
  _removedByAccountId: string
) {
  try {
    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });

    if (!organization) {
      throw new HttpError(404, 'Organization not found');
    }

    // Get or create the SUPER_ADMIN role for this organization
    const superAdminRole = await getOrCreateSuperAdminRole(organizationId);

    // Verify the manager is actually a superadmin for this organization
    const manager = await prisma.organizationManager.findFirst({
      where: {
        id: managerId,
        organizationId,
        organizationRoleId: superAdminRole.id,
        deletedAt: null,
        account: {
          user: {
            userType: 'ORGANIZATION_USER',
            organizationId: { not: null },
          },
        },
      },
    });

    if (!manager) {
      throw new HttpError(404, 'Superadmin not found for this organization');
    }

    // Soft delete the manager and set organization as unauthorized
    const result = await prisma.$transaction(async tx => {
      // Soft delete the manager
      await tx.organizationManager.update({
        where: { id: managerId },
        data: {
          deletedAt: new Date(),
        },
      });

      // Set organization as unauthorized
      await tx.organization.update({
        where: { id: organizationId },
        data: {
          isAuthorized: false,
        },
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to remove superadmin', {
      details: error,
    });
  }
}

/**
 * Get invitation by token (for accepting invitations)
 */
export async function getInvitationByToken(token: string) {
  try {
    // Verify and decode the JWT token
    const decoded = verifyOrganizationInvitationToken(token);

    // Fetch the invitation from database
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: decoded.invitationId },
      include: {
        organization: {
          include: {
            address: true,
          },
        },
        organizationRole: true,
      },
    });

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found');
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

    return invitation;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to get invitation by token', {
      details: error,
    });
  }
}

/**
 * Revoke an organization invitation
 * Hard deletes the invitation to avoid unique constraint violations when re-inviting
 */
export async function revokeInvitation(invitationId: string) {
  try {
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        organizationRole: true,
      },
    });

    if (!invitation) {
      throw new HttpError(404, 'Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new HttpError(409, 'Invitation has already been accepted');
    }

    if (invitation.deletedAt) {
      throw new HttpError(410, 'Invitation has already been revoked');
    }

    // Hard delete the invitation to avoid unique constraint violations
    // when re-inviting the same email to the same organization/role
    await prisma.organizationInvitation.delete({
      where: { id: invitationId },
    });

    return invitation;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to revoke invitation', {
      details: error,
    });
  }
}

/**
 * Activate a user (set account status to ACTIVE)
 */
export async function activateUser(managerId: string) {
  try {
    const manager = await prisma.organizationManager.findUnique({
      where: { id: managerId },
      include: {
        account: true,
      },
    });

    if (!manager) {
      throw new HttpError(404, 'User not found');
    }

    if (manager.deletedAt) {
      throw new HttpError(410, 'User has been deleted');
    }

    // Update account status to ACTIVE
    await prisma.account.update({
      where: { id: manager.accountId },
      data: { status: 'ACTIVE' },
    });

    // Return updated manager
    const updatedManager = await prisma.organizationManager.findUnique({
      where: { id: managerId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        organizationRole: true,
        department: true,
      },
    });

    return updatedManager!;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to activate user', {
      details: error,
    });
  }
}

/**
 * Deactivate a user (set account status to INACTIVE)
 */
export async function deactivateUser(managerId: string) {
  try {
    const manager = await prisma.organizationManager.findUnique({
      where: { id: managerId },
      include: {
        account: true,
      },
    });

    if (!manager) {
      throw new HttpError(404, 'User not found');
    }

    if (manager.deletedAt) {
      throw new HttpError(410, 'User has been deleted');
    }

    // Update account status to INACTIVE
    await prisma.account.update({
      where: { id: manager.accountId },
      data: { status: 'INACTIVE' },
    });

    // Return updated manager
    const updatedManager = await prisma.organizationManager.findUnique({
      where: { id: managerId },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        organizationRole: true,
        department: true,
      },
    });

    return updatedManager!;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    logger.error(error);
    throw new HttpError(500, 'Failed to deactivate user', {
      details: error,
    });
  }
}
