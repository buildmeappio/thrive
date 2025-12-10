import { HttpError } from '@/utils/httpError';
import { CreateCaseStatusInput, UpdateCaseStatusInput, CaseStatusData } from '../types/CaseStatus';
import prisma from '@/lib/db';

export const createCaseStatus = async (data: CreateCaseStatusInput) => {
  try {
    // Check if name already exists
    const existingCaseStatus = await prisma.caseStatus.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingCaseStatus) {
      throw HttpError.badRequest('A case status with this name already exists');
    }

    const caseStatus = await prisma.caseStatus.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return caseStatus;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateCaseStatus = async (id: string, data: UpdateCaseStatusInput) => {
  try {
    // Check if case status exists
    const existingCaseStatus = await prisma.caseStatus.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingCaseStatus) {
      throw HttpError.notFound('Case status not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingCaseStatus.name) {
      const nameExists = await prisma.caseStatus.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A case status with this name already exists');
      }
    }

    const updateData: Partial<{ name: string; description: string | null }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;

    const caseStatus = await prisma.caseStatus.update({
      where: { id },
      data: updateData,
    });

    return caseStatus;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getCaseStatuses = async (): Promise<CaseStatusData[]> => {
  try {
    const caseStatuses = await prisma.caseStatus.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return caseStatuses.map(caseStatus => ({
      id: caseStatus.id,
      name: caseStatus.name,
      description: caseStatus.description,
      createdAt: caseStatus.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getCaseStatusById = async (id: string) => {
  try {
    const caseStatus = await prisma.caseStatus.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!caseStatus) {
      throw HttpError.notFound('Case status not found');
    }

    return caseStatus;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};