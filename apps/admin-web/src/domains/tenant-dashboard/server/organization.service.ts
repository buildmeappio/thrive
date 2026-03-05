import 'server-only';
import { PrismaClient } from '@thrive/database';

/**
 * Tenant-aware organization service
 */
class TenantOrganizationService {
  constructor(private prisma: PrismaClient) {}

  async getOrganizations() {
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
          take: 1,
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrganizationTypes() {
    return await this.prisma.organizationType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

export function createTenantOrganizationService(prisma: PrismaClient) {
  return new TenantOrganizationService(prisma);
}
