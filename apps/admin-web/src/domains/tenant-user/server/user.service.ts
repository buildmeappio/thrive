import 'server-only';
import { PrismaClient } from '@thrive/database';
import { UserData } from '../types/UserData';

/**
 * Tenant-aware user service
 */
class TenantUserService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Resolve tenant User id from Keycloak sub (for current user).
   * Returns null if no user has this keycloakSub.
   */
  async getUserIdByKeycloakSub(keycloakSub: string): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        keycloakSub,
        deletedAt: null,
      },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  /**
   * Ensure a User exists in the tenant DB for the given Keycloak identity.
   * - If a user with this keycloakSub already exists, does nothing.
   * - If we have email and an existing user matches (e.g. seeded user), links them by setting keycloakSub.
   * - Otherwise creates a new User and Account.
   * Call this on first login so the tenant creator/admin appears in the Users list and currentUserId resolves.
   */
  async ensureUserFromKeycloak(params: {
    keycloakSub: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  }): Promise<void> {
    const existingBySub = await this.prisma.user.findFirst({
      where: {
        keycloakSub: params.keycloakSub,
        deletedAt: null,
      },
    });
    if (existingBySub) return;

    const emailFromTicket = (params.email ?? '').trim();
    if (emailFromTicket) {
      const existingByEmail = await this.prisma.user.findFirst({
        where: {
          email: emailFromTicket,
          deletedAt: null,
          keycloakSub: null,
        },
      });
      if (existingByEmail) {
        await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { keycloakSub: params.keycloakSub },
        });
        return;
      }
    }

    const firstName = (params.firstName ?? '').trim() || 'User';
    const lastName = (params.lastName ?? '').trim() || '';
    const email = emailFromTicket || `${params.keycloakSub}@keycloak.local`;

    const role = await this.prisma.role.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    if (!role) {
      throw new Error('Tenant has no roles; run seeders first.');
    }

    await this.prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          keycloakSub: params.keycloakSub,
          mustResetPassword: false,
          userType: 'ADMIN',
        },
      });
      await tx.account.create({
        data: {
          userId: user.id,
          roleId: role.id,
          status: 'ACTIVE',
          isVerified: true,
        },
      });
    });
  }

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
        isActive: account?.status === 'ACTIVE' || false,
        mustResetPassword: user.mustResetPassword ?? false,
        createdAt: user.createdAt.toISOString(),
      };
    });
  }
}

export function createTenantUserService(prisma: PrismaClient) {
  return new TenantUserService(prisma);
}
