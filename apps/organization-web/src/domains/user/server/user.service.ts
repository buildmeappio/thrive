import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { AccountStatus } from '@thrive/database';

const listOrganizationUsers = async (organizationId: string) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        userType: 'ORGANIZATION_USER',
        organizationId: organizationId,
        accounts: {
          some: {
            managers: {
              some: {
                organizationId: organizationId,
                deletedAt: null,
              },
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        mustResetPassword: true,
        createdAt: true,
        accounts: {
          where: {
            managers: {
              some: {
                organizationId: organizationId,
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
                organizationId: organizationId,
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
    });

    return users;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to list organization users');
  }
};

const toggleUserStatus = async (userId: string, organizationId: string, status: AccountStatus) => {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        managers: {
          some: {
            organizationId: organizationId,
            deletedAt: null,
          },
        },
      },
    });

    if (!account) {
      throw HttpError.notFound('Account not found');
    }

    const updated = await prisma.account.update({
      where: { id: account.id },
      data: { status },
      select: {
        id: true,
        status: true,
      },
    });
    return updated;
  } catch (error) {
    throw HttpError.handleServiceError(error, 'Failed to update user status');
  }
};

const userService = {
  listOrganizationUsers,
  toggleUserStatus,
};

export default userService;
