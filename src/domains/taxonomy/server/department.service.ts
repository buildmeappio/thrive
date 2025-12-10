import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateDepartmentInput, UpdateDepartmentInput, DepartmentData } from '../types/Department';

export const createDepartment = async (data: CreateDepartmentInput) => {
  try {
    // Check if name already exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingDepartment) {
      throw HttpError.badRequest('A department with this name already exists');
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
      },
    });

    return department;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateDepartment = async (id: string, data: UpdateDepartmentInput) => {
  try {
    // Check if department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingDepartment) {
      throw HttpError.notFound('Department not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingDepartment.name) {
      const nameExists = await prisma.department.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A department with this name already exists');
      }
    }

    const updateData: Partial<{ name: string }> = {};
    if (data.name !== undefined) updateData.name = data.name;

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    return department;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getDepartments = async (): Promise<DepartmentData[]> => {
  try {
    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return departments.map(department => ({
      id: department.id,
      name: department.name,
      createdAt: department.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getDepartmentById = async (id: string) => {
  try {
    const department = await prisma.department.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!department) {
      throw HttpError.notFound('Department not found');
    }

    return department;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};


