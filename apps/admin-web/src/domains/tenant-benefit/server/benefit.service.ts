import 'server-only';
import { PrismaClient } from '@thrive/database';
import { BenefitData } from '../types/BenefitData';

export type CreateBenefitInput = {
  examinationTypeId: string;
  benefit: string;
  description?: string | null;
};

export type UpdateBenefitInput = {
  examinationTypeId?: string;
  benefit?: string;
  description?: string | null;
};

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

  async getBenefitById(id: string): Promise<BenefitData> {
    const benefit = await this.prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        examinationType: true,
      },
    });

    if (!benefit || benefit.examinationType.deletedAt !== null) {
      throw new Error('Benefit not found');
    }

    return {
      id: benefit.id,
      examinationTypeId: benefit.examinationTypeId,
      examinationTypeName: benefit.examinationType.name,
      benefit: benefit.benefit,
      description: benefit.description,
      createdAt: benefit.createdAt.toISOString(),
    };
  }

  async createBenefit(data: CreateBenefitInput): Promise<BenefitData> {
    const examinationType = await this.prisma.examinationType.findFirst({
      where: {
        id: data.examinationTypeId,
        deletedAt: null,
      },
    });

    if (!examinationType) {
      throw new Error('Examination type not found');
    }

    const benefit = await this.prisma.examinationTypeBenefit.create({
      data: {
        examinationTypeId: data.examinationTypeId,
        benefit: data.benefit,
        description: data.description?.trim() || null,
      },
      include: {
        examinationType: true,
      },
    });

    return {
      id: benefit.id,
      examinationTypeId: benefit.examinationTypeId,
      examinationTypeName: benefit.examinationType.name,
      benefit: benefit.benefit,
      description: benefit.description,
      createdAt: benefit.createdAt.toISOString(),
    };
  }

  async updateBenefit(id: string, data: UpdateBenefitInput): Promise<BenefitData> {
    const existingBenefit = await this.prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBenefit) {
      throw new Error('Benefit not found');
    }

    if (data.examinationTypeId && data.examinationTypeId !== existingBenefit.examinationTypeId) {
      const examinationType = await this.prisma.examinationType.findFirst({
        where: {
          id: data.examinationTypeId,
          deletedAt: null,
        },
      });

      if (!examinationType) {
        throw new Error('Examination type not found');
      }
    }

    const updateData: Partial<{
      examinationTypeId: string;
      benefit: string;
      description: string | null;
    }> = {};
    if (data.examinationTypeId !== undefined) updateData.examinationTypeId = data.examinationTypeId;
    if (data.benefit !== undefined) updateData.benefit = data.benefit;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;

    const benefit = await this.prisma.examinationTypeBenefit.update({
      where: { id },
      data: updateData,
      include: {
        examinationType: true,
      },
    });

    return {
      id: benefit.id,
      examinationTypeId: benefit.examinationTypeId,
      examinationTypeName: benefit.examinationType.name,
      benefit: benefit.benefit,
      description: benefit.description,
      createdAt: benefit.createdAt.toISOString(),
    };
  }

  async deleteBenefit(id: string): Promise<void> {
    const benefit = await this.prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!benefit) {
      throw new Error('Benefit not found');
    }

    await this.prisma.examinationTypeBenefit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export function createTenantBenefitService(prisma: PrismaClient) {
  return new TenantBenefitService(prisma);
}
