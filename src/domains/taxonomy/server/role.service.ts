import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateRoleInput, UpdateRoleInput, RoleData } from '../types/Role';

export const createRole = async (data: CreateRoleInput) => {
  try {
    // Check if name already exists
    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingRole) {
      throw HttpError.badRequest('A role with this name already exists');
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
      },
    });

    return role;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateRole = async (id: string, data: UpdateRoleInput) => {
  try {
    // Check if role exists
    const existingRole = await prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingRole) {
      throw HttpError.notFound('Role not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingRole.name) {
      const nameExists = await prisma.role.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A role with this name already exists');
      }
    }

    const updateData: Partial<{ name: string }> = {};
    if (data.name !== undefined) updateData.name = data.name;

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    return role;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getRoles = async (): Promise<RoleData[]> => {
  try {
    const roles = await prisma.role.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getRoleById = async (id: string) => {
  try {
    const role = await prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!role) {
      throw HttpError.notFound('Role not found');
    }

    return role;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

const roleService = {
  createRole,
  updateRole,
  getRoles,
  getRoleById,
};

export default roleService;

