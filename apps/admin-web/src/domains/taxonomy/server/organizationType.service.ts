import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import {
  CreateOrganizationTypeInput,
  UpdateOrganizationTypeInput,
  OrganizationTypeData,
} from '../types/OrganizationType';

export const createOrganizationType = async (data: CreateOrganizationTypeInput) => {
  try {
    // Check if name already exists
    const existingOrganizationType = await prisma.organizationType.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingOrganizationType) {
      throw HttpError.badRequest('An organization type with this name already exists');
    }

    const organizationType = await prisma.organizationType.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return organizationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const updateOrganizationType = async (id: string, data: UpdateOrganizationTypeInput) => {
  try {
    // Check if organization type exists
    const existingOrganizationType = await prisma.organizationType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingOrganizationType) {
      throw HttpError.notFound('Organization type not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingOrganizationType.name) {
      const nameExists = await prisma.organizationType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('An organization type with this name already exists');
      }
    }

    const updateData: Partial<{ name: string; description: string | null }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;

    const organizationType = await prisma.organizationType.update({
      where: { id },
      data: updateData,
    });

    return organizationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getOrganizationTypes = async (): Promise<OrganizationTypeData[]> => {
  try {
    const organizationTypes = await prisma.organizationType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizationTypes.map(organizationType => ({
      id: organizationType.id,
      name: organizationType.name,
      description: organizationType.description,
      createdAt: organizationType.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getOrganizationTypeById = async (id: string) => {
  try {
    const organizationType = await prisma.organizationType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!organizationType) {
      throw HttpError.notFound('Organization type not found');
    }

    return organizationType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};
