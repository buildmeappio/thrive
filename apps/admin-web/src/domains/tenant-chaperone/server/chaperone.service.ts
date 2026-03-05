import 'server-only';
import { PrismaClient } from '@thrive/database';
import { ChaperoneData } from '../types/ChaperoneData';

/**
 * Tenant-aware chaperone service
 */
class TenantChaperoneService {
  constructor(private prisma: PrismaClient) {}

  async getChaperones(): Promise<ChaperoneData[]> {
    const chaperones = await this.prisma.chaperone.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chaperones.map(chaperone => ({
      id: chaperone.id,
      firstName: chaperone.firstName,
      lastName: chaperone.lastName,
      email: chaperone.email,
      phone: chaperone.phone,
      gender: chaperone.gender,
      fullName: `${chaperone.firstName} ${chaperone.lastName}`,
      createdAt: chaperone.createdAt,
    }));
  }
}

export function createTenantChaperoneService(prisma: PrismaClient) {
  return new TenantChaperoneService(prisma);
}
