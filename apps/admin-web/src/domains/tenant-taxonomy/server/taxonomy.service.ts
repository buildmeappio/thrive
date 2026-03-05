import 'server-only';
import { PrismaClient } from '@thrive/database';
import { TaxonomyType } from '../types/TaxonomyData';

/**
 * Tenant-aware taxonomy service
 */
class TenantTaxonomyService {
  constructor(private prisma: PrismaClient) {}

  async getTaxonomies(type: TaxonomyType) {
    // Map taxonomy types to Prisma models
    const modelMap: Record<TaxonomyType, string> = {
      caseStatus: 'caseStatus',
      caseType: 'caseType',
      claimType: 'claimType',
      department: 'department',
      examinationType: 'examinationType',
      examinationTypeBenefit: 'examinationTypeBenefit',
      language: 'language',
      organizationType: 'organizationType',
      role: 'role',
      maximumDistanceTravel: 'maximumDistanceTravel',
      yearsOfExperience: 'yearsOfExperience',
      configuration: 'configuration',
      assessmentType: 'assessmentType',
      professionalTitle: 'professionalTitle',
    };

    const model = modelMap[type];
    if (!model) {
      throw new Error(`Unknown taxonomy type: ${type}`);
    }

    // Use dynamic Prisma access
    const result = await (this.prisma as any)[model].findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return result;
  }
}

export function createTenantTaxonomyService(prisma: PrismaClient) {
  return new TenantTaxonomyService(prisma);
}
