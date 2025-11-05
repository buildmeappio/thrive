import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateBenefitInput, UpdateBenefitInput, BenefitData } from '../types/Benefit';

export const createBenefit = async (data: CreateBenefitInput) => {
  try {
    // Check if examination type exists
    const examinationType = await prisma.examinationType.findFirst({
      where: {
        id: data.examinationTypeId,
        deletedAt: null,
      },
    });

    if (!examinationType) {
      throw HttpError.notFound('Examination type not found');
    }

    const benefit = await prisma.examinationTypeBenefit.create({
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
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateBenefit = async (id: string, data: UpdateBenefitInput) => {
  try {
    const existingBenefit = await prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBenefit) {
      throw HttpError.notFound('Benefit not found');
    }

    if (data.examinationTypeId && data.examinationTypeId !== existingBenefit.examinationTypeId) {
      const examinationType = await prisma.examinationType.findFirst({
        where: {
          id: data.examinationTypeId,
          deletedAt: null,
        },
      });

      if (!examinationType) {
        throw HttpError.notFound('Examination type not found');
      }
    }

    const updateData: Partial<{ examinationTypeId: string; benefit: string; description: string | null }> = {};
    if (data.examinationTypeId !== undefined) updateData.examinationTypeId = data.examinationTypeId;
    if (data.benefit !== undefined) updateData.benefit = data.benefit;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;

    const benefit = await prisma.examinationTypeBenefit.update({
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
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getBenefits = async (): Promise<BenefitData[]> => {
  try {
    const benefits = await prisma.examinationTypeBenefit.findMany({
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

    return benefits.map(benefit => ({
      id: benefit.id,
      examinationTypeId: benefit.examinationTypeId,
      examinationTypeName: benefit.examinationType.name,
      benefit: benefit.benefit,
      description: benefit.description,
      createdAt: benefit.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getBenefitById = async (id: string): Promise<BenefitData> => {
  try {
    const benefit = await prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        examinationType: true,
      },
    });

    if (!benefit) {
      throw HttpError.notFound('Benefit not found');
    }

    return {
      id: benefit.id,
      examinationTypeId: benefit.examinationTypeId,
      examinationTypeName: benefit.examinationType.name,
      benefit: benefit.benefit,
      description: benefit.description,
      createdAt: benefit.createdAt.toISOString(),
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const deleteBenefit = async (id: string) => {
  try {
    const benefit = await prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!benefit) {
      throw HttpError.notFound('Benefit not found');
    }

    await prisma.examinationTypeBenefit.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

