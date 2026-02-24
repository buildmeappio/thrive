import prisma from '@/lib/db';
import { HttpError } from '@/utils/httpError';

export type CreateAssessmentTypeInput = {
  name: string;
  description?: string | null;
};

export type UpdateAssessmentTypeInput = Partial<CreateAssessmentTypeInput>;

export type AssessmentTypeData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export const createAssessmentType = async (data: CreateAssessmentTypeInput) => {
  try {
    // Check if name already exists
    const existingAssessmentType = await prisma.assessmentType.findFirst({
      where: {
        name: data.name,
        deletedAt: null,
      },
    });

    if (existingAssessmentType) {
      throw HttpError.badRequest('An assessment type with this name already exists');
    }

    const assessmentType = await prisma.assessmentType.create({
      data: {
        name: data.name,
        description: data.description || null,
      },
    });

    return assessmentType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const updateAssessmentType = async (id: string, data: UpdateAssessmentTypeInput) => {
  try {
    // Check if assessment type exists
    const existingAssessmentType = await prisma.assessmentType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingAssessmentType) {
      throw HttpError.notFound('Assessment type not found');
    }

    // If name is being updated, check if it's already in use
    if (data.name && data.name !== existingAssessmentType.name) {
      const nameExists = await prisma.assessmentType.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest('An assessment type with this name already exists');
      }
    }

    const updateData: Partial<{ name: string; description: string | null }> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;

    const assessmentType = await prisma.assessmentType.update({
      where: { id },
      data: updateData,
    });

    return assessmentType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getAssessmentTypes = async (): Promise<AssessmentTypeData[]> => {
  try {
    const assessmentTypes = await prisma.assessmentType.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate frequency for each assessment type
    const assessmentTypesWithFrequency = await Promise.all(
      assessmentTypes.map(async assessmentType => {
        // Count usage in ExaminerApplication
        const applicationCount = await prisma.examinerApplication.count({
          where: {
            assessmentTypeIds: {
              has: assessmentType.id,
            },
            deletedAt: null,
          },
        });

        // Count usage in ExaminerProfile
        const profileCount = await prisma.examinerProfile.count({
          where: {
            assessmentTypes: {
              has: assessmentType.id,
            },
            deletedAt: null,
          },
        });

        const frequency = applicationCount + profileCount;

        return {
          id: assessmentType.id,
          name: assessmentType.name,
          description: assessmentType.description,
          createdAt: assessmentType.createdAt.toISOString(),
          frequency,
        };
      })
    );

    return assessmentTypesWithFrequency;
  } catch {
    throw HttpError.internalServerError('Internal server error');
  }
};

export const getAssessmentTypeById = async (id: string) => {
  try {
    const assessmentType = await prisma.assessmentType.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!assessmentType) {
      throw HttpError.notFound('Assessment type not found');
    }

    return assessmentType;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError('Internal server error');
  }
};
