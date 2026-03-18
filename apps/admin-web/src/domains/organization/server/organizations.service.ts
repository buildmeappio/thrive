import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { signOrganizationInvitationToken, verifyOrganizationInvitationToken } from '@/lib/jwt';
import emailService from '@/services/email.service';
import { ENV } from '@/constants/variables';
import { ORGANIZATION_MESSAGES } from '@/constants/messages';
import { ensureOrganizationRoles } from './utils/ensureOrganizationRoles';
import type { CreateOrganizationInput } from '@/domains/organization/types/CreateOrganization.types';

/**
 * Tenant-aware organization service
 */
class TenantOrganizationService {
  constructor(private prisma: PrismaClient) {}

  async listOrganizations() {
    try {
      return await this.prisma.organization.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          address: true,
          manager: {
            where: {
              deletedAt: null,
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
        orderBy: {
          createdAt: 'desc', // Sort by creation time, newest first
        },
      });
    } catch (error) {
      logger.error('Error listing organizations:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LIST_ORGANIZATIONS, {
        details: error,
      });
    }
  }

  async getOrganizationById(id: string) {
    try {
      return await this.prisma.organization.findUnique({
        where: { id, deletedAt: null },
        include: {
          address: true,
          locations: {
            where: {
              deletedAt: null,
              isActive: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
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
      logger.error('Error getting organization:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_LOAD_ORGANIZATION, {
        details: error,
      });
    }
  }

  async listOrganizationTypes() {
    try {
      return await this.prisma.organizationType.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error listing organization types:', error);
      throw new HttpError(500, 'Failed to load organization types', {
        details: error,
      });
    }
  }

  async checkOrganizationNameExists(name: string): Promise<boolean> {
    try {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return false;
      }

      // Find all organizations with similar names (case-insensitive)
      const organizations = await this.prisma.organization.findMany({
        where: {
          name: {
            contains: trimmedName,
            mode: 'insensitive',
          },
          deletedAt: null,
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
      logger.error('Error checking organization name:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CHECK_NAME, {
        details: error,
      });
    }
  }

  async createOrganization(data: CreateOrganizationInput) {
    try {
      // Check if email is already registered as a user (any user type)
      const normalizedEmail = data.email.toLowerCase().trim();
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          organizationId: true,
          userType: true,
        },
      });

      // If user exists with any user type, reject the invitation
      if (existingUser) {
        throw HttpError.badRequest(ORGANIZATION_MESSAGES.ERROR.EMAIL_ALREADY_REGISTERED);
      }

      // Check if there's an existing invitation (pending or accepted) for this email with any organization
      const existingInvitationForAnyOrg = await this.prisma.organizationInvitation.findFirst({
        where: {
          email: normalizedEmail,
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // If there's an existing invitation for any organization, reject
      if (existingInvitationForAnyOrg) {
        throw HttpError.badRequest(ORGANIZATION_MESSAGES.ERROR.EMAIL_ALREADY_INVITED);
      }

      // Create organization and SUPER_ADMIN role in a transaction
      const result = await this.prisma.$transaction(async tx => {
        // Determine if organization details are provided (timezone is now part of HQ address)
        const hasOrgDetails = data.organizationType && data.organizationSize;

        // Determine if HQ address is provided
        const hasHqAddress =
          data.hqAddress &&
          data.hqAddress.line1 &&
          data.hqAddress.city &&
          data.hqAddress.state &&
          data.hqAddress.postalCode;

        // Set status to ACCEPTED if both org details and HQ address are provided
        const shouldBeAccepted = hasOrgDetails && hasHqAddress;

        // Create organization (not authorized until superadmin accepts invitation)
        // type and addressId are now optional, so we don't need to create them
        const organization = await tx.organization.create({
          data: {
            name: data.organizationName.trim(),
            website: data.website?.trim() || null,
            isAuthorized: shouldBeAccepted ? true : false,
            status: shouldBeAccepted ? 'ACCEPTED' : 'PENDING',
            type: data.organizationType || null,
            size: data.organizationSize || null,
            addressId: null, // Can be set later
            hqAddressJson: hasHqAddress ? (data.hqAddress as any) : null,
            timezone: data.timezone || null,
          },
          include: {
            address: true,
          },
        });

        // Create HQ location if address is provided
        let hqLocation = null;
        if (hasHqAddress) {
          // Use hqAddressTimezone if provided, otherwise use organization timezone, otherwise default
          const locationTimezone = data.hqAddressTimezone || data.timezone || 'America/Toronto';
          hqLocation = await tx.location.create({
            data: {
              organizationId: organization.id,
              name: 'Headquarters',
              addressJson: data.hqAddress as any,
              timezone: locationTimezone,
              isActive: true,
            },
          });
        }

        // Ensure all default roles and permissions exist for this organization
        // This will create SUPER_ADMIN, LOCATION_MANAGER, FINANCE_ADMIN, ADJUSTOR roles
        // and assign appropriate permissions to each role
        await ensureOrganizationRoles(organization.id, tx as any);

        // Get the SUPER_ADMIN role that was created by ensureOrganizationRoles
        const superAdminRole = await tx.organizationRole.findFirst({
          where: {
            organizationId: organization.id,
            key: 'SUPER_ADMIN',
            deletedAt: null,
          },
        });

        if (!superAdminRole) {
          throw new HttpError(500, 'Failed to create SUPER_ADMIN role for organization');
        }

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
          roleKey: 'SUPER_ADMIN',
        });

        // Update invitation with token and return the updated invitation
        const updatedInvitation = await tx.organizationInvitation.update({
          where: { id: invitation.id },
          data: { token },
        });

        return {
          organization,
          invitation: updatedInvitation,
          superAdminRole,
          hqLocation,
        };
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
      logger.error('Error creating organization:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_CREATE_ORGANIZATION, {
        details: error,
      });
    }
  }

  // Helper function to get or create the SUPER_ADMIN role for an organization
  async getOrCreateSuperAdminRole(organizationId: string) {
    try {
      // Try to find existing SUPER_ADMIN role for this organization
      let superAdminRole = await this.prisma.organizationRole.findFirst({
        where: {
          key: 'SUPER_ADMIN',
          organizationId,
          deletedAt: null,
        },
      });

      // If it doesn't exist, create it
      if (!superAdminRole) {
        superAdminRole = await this.prisma.organizationRole.create({
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
      logger.error('Error getting or creating SUPER_ADMIN role:', error);
      throw new HttpError(500, 'Failed to get or create SUPER_ADMIN role', {
        details: error,
      });
    }
  }

  /**
   * Invite a superadmin to an organization
   */
  async inviteSuperAdmin(
    organizationId: string,
    email: string,
    firstName: string,
    lastName: string,
    invitedByAccountId: string,
    organizationRoleId?: string
  ) {
    try {
      // Verify organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId, deletedAt: null },
        select: { id: true, name: true },
      });

      if (!organization) {
        throw new HttpError(404, 'Organization not found');
      }

      // Get the role - use provided roleId or default to SUPER_ADMIN
      let role;
      if (organizationRoleId) {
        role = await this.prisma.organizationRole.findUnique({
          where: { id: organizationRoleId, deletedAt: null },
        });
        if (!role || role.organizationId !== organizationId) {
          throw new HttpError(404, 'Role not found or does not belong to this organization');
        }
      } else {
        // Default to SUPER_ADMIN if no role provided (backward compatibility)
        role = await this.getOrCreateSuperAdminRole(organizationId);
      }

      // Check if email is already registered as a user (any user type)
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          organizationId: true,
          userType: true,
        },
      });

      // If user exists with any user type, reject the invitation
      if (existingUser) {
        throw HttpError.badRequest(ORGANIZATION_MESSAGES.ERROR.EMAIL_ALREADY_REGISTERED);
      }

      // Check if there's an existing invitation (pending or accepted) for this email with a DIFFERENT organization
      const existingInvitationForOtherOrg = await this.prisma.organizationInvitation.findFirst({
        where: {
          email: normalizedEmail,
          organizationId: { not: organizationId },
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // If there's an existing invitation for a different organization, reject
      if (existingInvitationForOtherOrg) {
        throw HttpError.badRequest(ORGANIZATION_MESSAGES.ERROR.EMAIL_ALREADY_INVITED);
      }

      // Check if there's an existing invitation for the same organization that was already accepted
      const acceptedInvitationForSameOrg = await this.prisma.organizationInvitation.findFirst({
        where: {
          email: normalizedEmail,
          organizationId,
          acceptedAt: { not: null },
          deletedAt: null,
        },
      });

      // If invitation was already accepted for this organization, reject
      if (acceptedInvitationForSameOrg) {
        throw HttpError.badRequest(ORGANIZATION_MESSAGES.ERROR.EMAIL_ALREADY_REGISTERED);
      }

      // Check if there's already a pending invitation for the same email and organization
      const existingInvitation = await this.prisma.organizationInvitation.findFirst({
        where: {
          organizationId,
          email: normalizedEmail,
          organizationRoleId: role.id,
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
            return await this.prisma.organizationInvitation.findUnique({
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
            return await this.prisma.organizationInvitation.findUnique({
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
      const result = await this.prisma.$transaction(async tx => {
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
            organizationRoleId: role.id,
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
          roleKey: role.key,
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
      logger.error('Error inviting superadmin:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_SEND_INVITATION, {
        details: error,
      });
    }
  }

  /**
   * Resend an invitation email
   * Deletes the previous invitation and creates a new one
   */
  async resendInvitation(invitationId: string) {
    try {
      const invitation = await this.prisma.organizationInvitation.findUnique({
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

      // Ensure the role has a key
      if (!invitation.organizationRole?.key) {
        throw new HttpError(400, 'Organization role is missing key');
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
      const newInvitation = await this.prisma.$transaction(async tx => {
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
          roleKey: invitation.organizationRole.key,
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
  async getOrganizationInvitations(organizationId: string) {
    try {
      const invitations = await this.prisma.organizationInvitation.findMany({
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
      logger.error('Error getting organization invitations:', error);
      throw new HttpError(500, 'Failed to get organization invitations', {
        details: error,
      });
    }
  }

  /**
   * Get the current superadmin for an organization
   */
  async getOrganizationSuperAdmin(organizationId: string) {
    try {
      // Get or create the SUPER_ADMIN role for this organization
      const superAdminRole = await this.getOrCreateSuperAdminRole(organizationId);

      // Find the superadmin manager
      const superAdmin = await this.prisma.organizationManager.findFirst({
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
      logger.error('Error getting organization superadmin:', error);
      throw new HttpError(500, 'Failed to get organization superadmin', {
        details: error,
      });
    }
  }

  /**
   * Remove a superadmin from an organization
   */
  async removeSuperAdmin(organizationId: string, managerId: string, _removedByAccountId: string) {
    try {
      // Verify organization exists
      const organization = await this.prisma.organization.findUnique({
        where: { id: organizationId, deletedAt: null },
        select: { id: true, name: true },
      });

      if (!organization) {
        throw new HttpError(404, 'Organization not found');
      }

      // Get or create the SUPER_ADMIN role for this organization
      const superAdminRole = await this.getOrCreateSuperAdminRole(organizationId);

      // Verify the manager is actually a superadmin for this organization
      const manager = await this.prisma.organizationManager.findFirst({
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
      const result = await this.prisma.$transaction(async tx => {
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
      logger.error('Error removing superadmin:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_REMOVE_SUPERADMIN, {
        details: error,
      });
    }
  }

  /**
   * Get invitation by token (for accepting invitations)
   */
  async getInvitationByToken(token: string) {
    try {
      // Verify and decode the JWT token
      const decoded = verifyOrganizationInvitationToken(token);

      // Fetch the invitation from database
      const invitation = await this.prisma.organizationInvitation.findUnique({
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
      logger.error('Error getting invitation by token:', error);
      throw new HttpError(500, 'Failed to get invitation by token', {
        details: error,
      });
    }
  }

  /**
   * Revoke an organization invitation
   * Hard deletes the invitation to avoid unique constraint violations when re-inviting
   */
  async revokeInvitation(invitationId: string) {
    try {
      const invitation = await this.prisma.organizationInvitation.findUnique({
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
      await this.prisma.organizationInvitation.delete({
        where: { id: invitationId },
      });

      return invitation;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      logger.error('Error revoking invitation:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_REVOKE_INVITATION, {
        details: error,
      });
    }
  }

  /**
   * Activate a user (set account status to ACTIVE)
   */
  async activateUser(managerId: string) {
    try {
      const manager = await this.prisma.organizationManager.findUnique({
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
      await this.prisma.account.update({
        where: { id: manager.accountId },
        data: { status: 'ACTIVE' },
      });

      // Return updated manager
      const updatedManager = await this.prisma.organizationManager.findUnique({
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
      logger.error('Error activating user:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_ACTIVATE_USER, {
        details: error,
      });
    }
  }

  /**
   * Deactivate a user (set account status to INACTIVE)
   */
  async deactivateUser(managerId: string) {
    try {
      const manager = await this.prisma.organizationManager.findUnique({
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
      await this.prisma.account.update({
        where: { id: manager.accountId },
        data: { status: 'INACTIVE' },
      });

      // Return updated manager
      const updatedManager = await this.prisma.organizationManager.findUnique({
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
      logger.error('Error deactivating user:', error);
      throw new HttpError(500, ORGANIZATION_MESSAGES.ERROR.FAILED_TO_DEACTIVATE_USER, {
        details: error,
      });
    }
  }
}

/**
 * Factory function to create tenant organization service
 */
export function createTenantOrganizationService(prisma: PrismaClient) {
  return new TenantOrganizationService(prisma);
}
