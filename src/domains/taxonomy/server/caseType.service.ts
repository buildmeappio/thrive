import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateCaseTypeInput, UpdateCaseTypeInput, CaseTypeData } from '../types/CaseType';

export const createCaseType = async (data: CreateCaseTypeInput) => {
  try {
    // Check if name already exists
    const existingCaseType = await prisma.caseType.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingCaseType) {
      throw HttpError.badRequest('A case type with this name already exists');
    }

    const caseType = await prisma.caseType.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return caseType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateCaseType = async (id: string, data: UpdateCaseTypeInput) => {
  try {
    // Check if case type exists
    const existingCaseType = await prisma.caseType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCaseType) {
      throw HttpError.notFound('Case type not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingCaseType.name) {
      const nameExists = await prisma.caseType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A case type with this name already exists');
      }
    }

    const updateData: Partial<{ name: string; description: string | null }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;

    const caseType = await prisma.caseType.update({
      where: { id },
      data: updateData,
    });

    return caseType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getCaseTypes = async (): Promise<CaseTypeData[]> => {
  try {
    const caseTypes = await prisma.caseType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return caseTypes.map(caseType => ({
      id: caseType.id,
      name: caseType.name,
      description: caseType.description,
      createdAt: caseType.createdAt.toISOString(),
    }));
  } catch (error) {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getCaseTypeById = async (id: string) => {
  try {
    const caseType = await prisma.caseType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!caseType) {
      throw HttpError.notFound('Case type not found');
    }

    return caseType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

const caseTypeService = {
  createCaseType,
  updateCaseType,
  getCaseTypes,
  getCaseTypeById,
};

export default caseTypeService;

