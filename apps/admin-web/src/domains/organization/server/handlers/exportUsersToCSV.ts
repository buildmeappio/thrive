'use server';

import { PrismaClient } from '@thrive/database';
import { HttpError } from '@/utils/httpError';
import logger from '@/utils/logger';
import { generateCSV } from '@/utils/csv';
import { Prisma, AccountStatus } from '@thrive/database';
import { formatE164ForDisplay, getE164PhoneNumber } from '@/utils/phoneNumber';

interface ExportUsersParams {
  organizationId: string;
  search?: string;
  status?: 'active' | 'inactive' | 'all' | 'invited';
  role?: string;
}

/**
 * Export users to CSV based on current filters
 * Exports ALL matching users (no pagination limit)
 */
const exportUsersToCSV = async (
  params: ExportUsersParams,
  prisma: PrismaClient
): Promise<{
  success: boolean;
  csv?: string;
  error?: string;
}> => {
  try {
    const { organizationId, search = '', status = 'all', role } = params;

    const now = new Date();

    // Build where clauses for users and invitations
    const userWhere: Prisma.UserWhereInput = {
      organizationId,
      deletedAt: null,
      userType: 'ORGANIZATION_USER',
      accounts: {
        some: {
          managers: {
            some: {
              organizationId,
              deletedAt: null,
            },
          },
        },
      },
    };

    const invitationWhere: Prisma.OrganizationInvitationWhereInput = {
      organizationId,
      deletedAt: null,
      acceptedAt: null,
      ...(role ? { organizationRoleId: role } : {}),
    };

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      userWhere.OR = [
        { email: { contains: searchLower, mode: 'insensitive' } },
        { firstName: { contains: searchLower, mode: 'insensitive' } },
        { lastName: { contains: searchLower, mode: 'insensitive' } },
      ];
      invitationWhere.OR = [{ email: { contains: searchLower, mode: 'insensitive' } }];
    }

    // Apply status filter
    if (status === 'active' || status === 'inactive') {
      const accountStatus = status === 'active' ? AccountStatus.ACTIVE : AccountStatus.INACTIVE;
      userWhere.accounts = {
        some: {
          status: accountStatus,
          managers: {
            some: {
              organizationId,
              deletedAt: null,
            },
          },
        },
      };
    }

    // Determine what to fetch
    const fetchUsers = status !== 'invited';
    const fetchInvitations = status !== 'active' && status !== 'inactive';

    // Fetch users with phone numbers
    const users = fetchUsers
      ? await prisma.user.findMany({
          where: userWhere,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            accounts: {
              where: {
                managers: {
                  some: {
                    organizationId,
                    deletedAt: null,
                  },
                },
              },
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
                status: true,
                managers: {
                  where: {
                    organizationId,
                    deletedAt: null,
                  },
                  select: {
                    organizationRole: {
                      select: {
                        name: true,
                      },
                    },
                  },
                  take: 1,
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    // Fetch invitations
    const invitations = fetchInvitations
      ? await prisma.organizationInvitation.findMany({
          where: {
            ...invitationWhere,
            expiresAt: { gt: now },
          },
          include: {
            organizationRole: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      : [];

    // Convert to CSV rows
    const csvRows: Record<string, string>[] = [];

    // Add user rows
    users.forEach(user => {
      const account = user.accounts[0];
      const organizationRole = account?.managers[0]?.organizationRole?.name;
      const roleName = organizationRole || '';

      // Format phone number consistently
      let formattedPhone = '';
      if (user.phone) {
        let e164Phone = user.phone;

        // If phone is not already in E.164 format, normalize it
        if (!user.phone.startsWith('+')) {
          const normalized = getE164PhoneNumber(user.phone);
          if (normalized) {
            e164Phone = normalized;
          }
        }

        // Format E.164 phone for display
        formattedPhone = formatE164ForDisplay(e164Phone) || e164Phone;
      }

      csvRows.push({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: formattedPhone,
        role: roleName,
      });
    });

    // Add invitation rows
    invitations.forEach(invitation => {
      csvRows.push({
        email: invitation.email || '',
        firstName: invitation.firstName || '',
        lastName: invitation.lastName || '',
        phoneNumber: '',
        role: invitation.organizationRole?.name || '',
      });
    });

    // Generate CSV with headers
    const headers = ['email', 'firstName', 'lastName', 'phoneNumber', 'role'];

    const csv = generateCSV(csvRows, headers);

    return {
      success: true,
      csv,
    };
  } catch (error) {
    logger.error('Error exporting users to CSV:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to export users',
    };
  }
};

export default exportUsersToCSV;
