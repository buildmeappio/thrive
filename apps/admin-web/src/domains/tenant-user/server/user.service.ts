import 'server-only';
import { PrismaClient } from '@thrive/database';
import { UserData } from '../types/UserData';

/**
 * Tenant-aware user service
 */
class TenantUserService {
  constructor(private prisma: PrismaClient) {}

  async getUsers(): Promise<UserData[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        accounts: {
          where: {
            deletedAt: null,
          },
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(user => {
      // Get the first non-deleted account with a non-deleted role
      const account = user.accounts.find(
        acc => acc.deletedAt === null && acc.role && acc.role.deletedAt === null
      );

      return {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        gender: user.gender,
        role: account?.role?.name || 'USER',
        isActive: account?.status === 'ACTIVE' ?? true,
        mustResetPassword: user.mustResetPassword ?? false,
        createdAt: user.createdAt.toISOString(),
      };
    });
  }
}

export function createTenantUserService(prisma: PrismaClient) {
  return new TenantUserService(prisma);
}
