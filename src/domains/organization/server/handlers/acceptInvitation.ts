'use server';
import { verifyOrganizationInvitationToken } from '@/lib/jwt';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import log from '@/utils/log';
import bcrypt from 'bcryptjs';
import { Roles } from '@/constants/role';
import { getE164PhoneNumber } from '@/utils/formatNumbers';
import { Prisma } from '@prisma/client';

interface AcceptInvitationData {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jobTitle?: string;
  departmentId?: string;
}

const acceptInvitation = async (data: AcceptInvitationData) => {
  try {
    const { token, password, firstName, lastName, phoneNumber, jobTitle, departmentId } = data;

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

    // Use role from token (preferred) or from invitation record
    const organizationRoleId = decoded.organizationRoleId || invitation.organizationRoleId;

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email.toLowerCase() },
    });

    if (existingUser) {
      throw new HttpError(409, 'User with this email already exists');
    }

    // Create user and link to organization in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email: invitation.email.toLowerCase(),
          phone: getE164PhoneNumber(phoneNumber),
          password: hashedPassword,
          userType: 'ORGANIZATION_USER',
          organizationId: invitation.organizationId,
          status: 'ACTIVE',
        },
      });

      // Get the Role for organization manager (using the Role table, not OrganizationRole)
      const orgManagerRole = await tx.role.findFirst({
        where: { name: Roles.ORGANIZATION_MANAGER },
      });

      if (!orgManagerRole) {
        throw new HttpError(404, 'Organization Manager role not found');
      }

      // Create Account
      const account = await tx.account.create({
        data: {
          userId: user.id,
          roleId: orgManagerRole.id,
        },
      });

      // Create Organization Manager with role from token
      const organizationManager = await tx.organizationManager.create({
        data: {
          organizationId: invitation.organizationId,
          accountId: account.id,
          jobTitle: jobTitle || null,
          departmentId: departmentId || null,
          organizationRoleId: organizationRoleId,
        },
      });

      // Mark invitation as accepted
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: {
          acceptedAt: new Date(),
          acceptedByManagerId: organizationManager.id,
        },
      });

      // Set organization as authorized
      await tx.organization.update({
        where: { id: invitation.organizationId },
        data: {
          isAuthorized: true,
        },
      });

      return {
        userId: user.id,
        accountId: account.id,
        organizationId: invitation.organizationId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    log.error('Error accepting invitation:', error);
    if (error instanceof HttpError) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Failed to accept invitation',
    };
  }
};

export default acceptInvitation;
