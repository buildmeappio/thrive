import 'server-only';
import { PrismaClient } from '@thrive/database';
import { BenefitData } from '../types/BenefitData';

/**
 * Tenant-aware benefit service
 */
class TenantBenefitService {
  constructor(private prisma: PrismaClient) {}

  async getBenefits(): Promise<BenefitData[]> {
    const benefits = await this.prisma.examinationTypeBenefit.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        examinationType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return benefits
      .filter(benefit => benefit.examinationType.deletedAt === null)
      .map(benefit => ({
        id: benefit.id,
        examinationTypeId: benefit.examinationTypeId,
        examinationTypeName: benefit.examinationType.name,
        benefit: benefit.benefit,
        description: benefit.description,
        createdAt: benefit.createdAt.toISOString(),
      }));
  }
}

export function createTenantBenefitService(prisma: PrismaClient) {
  return new TenantBenefitService(prisma);
}
