import { HttpError } from '@/utils/httpError';
import { CreateChaperoneInput, UpdateChaperoneInput, ChaperoneData } from '../types/Chaperone';
import prisma from '@/lib/db';

export const createChaperone = async (data: CreateChaperoneInput) => {
  try {
    // Check if email already exists
    const existingChaperone = await prisma.chaperone.findFirst({
      where: {
        email: data.email,
        deletedAt: null,
      },
    });

    if (existingChaperone) {
      throw HttpError.badRequest('A chaperone with this email already exists');
    }

    const chaperone = await prisma.chaperone.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ? data.phone : null,
        gender: data.gender || null,
      },
    });

    return chaperone;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateChaperone = async (id: string, data: UpdateChaperoneInput) => {
  try {
    // Check if chaperone exists
    const existingChaperone = await prisma.chaperone.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingChaperone) {
      throw HttpError.notFound('Chaperone not found');
    }

    // If email is being updated, check if it's already in use
    if (data.email && data.email !== existingChaperone.email) {
      const emailExists = await prisma.chaperone.findFirst({
        where: {
          email: data.email,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (emailExists) {
        throw HttpError.badRequest('A chaperone with this email already exists');
      }
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone : null;
    if (data.gender !== undefined) updateData.gender = data.gender || null;

    const chaperone = await prisma.chaperone.update({
      where: { id },
      data: updateData,
    });

    return chaperone;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getChaperones = async (): Promise<ChaperoneData[]> => {
  try {
    const chaperones = await prisma.chaperone.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return chaperones.map(chaperone => ({
      id: chaperone.id,
      firstName: chaperone.firstName,
      lastName: chaperone.lastName,
      email: chaperone.email,
      phone: chaperone.phone,
      gender: chaperone.gender,
      fullName: `${chaperone.firstName} ${chaperone.lastName}`,
      createdAt: chaperone.createdAt,
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getChaperoneById = async (id: string) => {
  try {
    const chaperone = await prisma.chaperone.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!chaperone) {
      throw HttpError.notFound('Chaperone not found');
    }

    return chaperone;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

const chaperoneService = {
  createChaperone,
  updateChaperone,
  getChaperones,
  getChaperoneById,
};

export default chaperoneService;

