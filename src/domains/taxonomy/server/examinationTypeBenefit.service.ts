import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateExaminationTypeBenefitInput, UpdateExaminationTypeBenefitInput, ExaminationTypeBenefitData } from '../types/ExaminationTypeBenefit';

export const createExaminationTypeBenefit = async (data: CreateExaminationTypeBenefitInput) => {
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

    const examinationTypeBenefit = await prisma.examinationTypeBenefit.create({
      data: {
        examinationTypeId: data.examinationTypeId,
        benefit: data.benefit,
      },
    });

    return examinationTypeBenefit;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateExaminationTypeBenefit = async (id: string, data: UpdateExaminationTypeBenefitInput) => {
  try {
    // Check if examination type benefit exists
    const existingBenefit = await prisma.examinationTypeBenefit.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingBenefit) {
      throw HttpError.notFound('Examination type benefit not found');
    }

    // If examination type is being updated, check if it exists
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

    const updateData: Partial<{ examinationTypeId: string; benefit: string }> = {};
    if (data.examinationTypeId !== undefined) updateData.examinationTypeId = data.examinationTypeId;
    if (data.benefit !== undefined) updateData.benefit = data.benefit;

    const examinationTypeBenefit = await prisma.examinationTypeBenefit.update({
      where: { id },
      data: updateData,
    });

    return examinationTypeBenefit;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getExaminationTypeBenefits = async (): Promise<ExaminationTypeBenefitData[]> => {
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
      createdAt: benefit.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getExaminationTypeBenefitById = async (id: string) => {
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
      throw HttpError.notFound('Examination type benefit not found');
    }

    return benefit;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};