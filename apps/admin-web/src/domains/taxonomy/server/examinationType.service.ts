import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import {
  CreateExaminationTypeInput,
  UpdateExaminationTypeInput,
  ExaminationTypeData,
} from '../types/ExaminationType';

export const createExaminationType = async (data: CreateExaminationTypeInput) => {
  try {
    // Check if name already exists
    const existingExaminationType = await prisma.examinationType.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingExaminationType) {
      throw HttpError.badRequest('An examination type with this name already exists');
    }

    const examinationType = await prisma.examinationType.create({
      data: {
        name: data.name,
        shortForm: data.shortForm || null,
        description: data.description || null,
      },
    });

    return examinationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const updateExaminationType = async (id: string, data: UpdateExaminationTypeInput) => {
  try {
    // Check if examination type exists
    const existingExaminationType = await prisma.examinationType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingExaminationType) {
      throw HttpError.notFound('Examination type not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingExaminationType.name) {
      const nameExists = await prisma.examinationType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('An examination type with this name already exists');
      }
    }

    const updateData: Partial<{
      name: string;
      shortForm: string | null;
      description: string | null;
    }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortForm !== undefined) updateData.shortForm = data.shortForm || null;
    if (data.description !== undefined) updateData.description = data.description || null;

    const examinationType = await prisma.examinationType.update({
      where: { id },
      data: updateData,
    });

    return examinationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getExaminationTypes = async (): Promise<ExaminationTypeData[]> => {
  try {
    const examinationTypes = await prisma.examinationType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return examinationTypes.map(examinationType => ({
      id: examinationType.id,
      name: examinationType.name,
      shortForm: examinationType.shortForm,
      description: examinationType.description,
      createdAt: examinationType.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getExaminationTypeById = async (id: string) => {
  try {
    const examinationType = await prisma.examinationType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!examinationType) {
      throw HttpError.notFound('Examination type not found');
    }

    return examinationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};
