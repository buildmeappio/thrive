'use server';
import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';
import { CreateLanguageInput, UpdateLanguageInput, LanguageData } from '../types/Language';

export const createLanguage = async (data: CreateLanguageInput) => {
  try {
    // Check if name already exists
    const existingLanguage = await prisma.language.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingLanguage) {
      throw HttpError.badRequest('A language with this name already exists');
    }

    const language = await prisma.language.create({
      data: {
        name: data.name,
      },
    });

    return language;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const updateLanguage = async (id: string, data: UpdateLanguageInput) => {
  try {
    // Check if language exists
    const existingLanguage = await prisma.language.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingLanguage) {
      throw HttpError.notFound('Language not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingLanguage.name) {
      const nameExists = await prisma.language.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('A language with this name already exists');
      }
    }

    const updateData: Partial<{ name: string }> = {};
    if (data.name !== undefined) updateData.name = data.name;

    const language = await prisma.language.update({
      where: { id },
      data: updateData,
    });

    return language;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getLanguages = async (): Promise<LanguageData[]> => {
  try {
    const languages = await prisma.language.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return languages.map(language => ({
      id: language.id,
      name: language.name,
      createdAt: language.createdAt.toISOString(),
    }));
  } catch {
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getLanguageById = async (id: string) => {
  try {
    const language = await prisma.language.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!language) {
      throw HttpError.notFound('Language not found');
    }

    return language;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};
