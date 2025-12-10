import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateClaimTypeInput, UpdateClaimTypeInput, ClaimTypeData } from '../types/ClaimType';

export const createClaimType = async (data: CreateClaimTypeInput) => {
  try {
    // Check if name already exists
    const existingClaimType = await prisma.claimType.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingClaimType) {
      throw HttpError.badRequest('A claim type with this name already exists');
    }

    const claimType = await prisma.claimType.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return claimType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateClaimType = async (id: string, data: UpdateClaimTypeInput) => {
  try {
    // Check if claim type exists
    const existingClaimType = await prisma.claimType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingClaimType) {
      throw HttpError.notFound('Claim type not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingClaimType.name) {
      const nameExists = await prisma.claimType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A claim type with this name already exists');
      }
    }

    const updateData: Partial<{ name: string; description: string | null }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;

    const claimType = await prisma.claimType.update({
      where: { id },
      data: updateData,
    });

    return claimType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getClaimTypes = async (): Promise<ClaimTypeData[]> => {
  try {
    const claimTypes = await prisma.claimType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return claimTypes.map(claimType => ({
      id: claimType.id,
      name: claimType.name,
      description: claimType.description,
      createdAt: claimType.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getClaimTypeById = async (id: string) => {
  try {
    const claimType = await prisma.claimType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!claimType) {
      throw HttpError.notFound('Claim type not found');
    }

    return claimType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};
