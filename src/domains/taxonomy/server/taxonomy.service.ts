import { HttpError } from '@/utils/httpError';
import { CreateTaxonomyInput, UpdateTaxonomyInput, TaxonomyData, TaxonomyType } from '../types/Taxonomy';
import prisma from '@/lib/db';

// Map taxonomy type to Prisma model
const getPrismaModel = (type: TaxonomyType) => {
  const modelMap: Record<TaxonomyType, any> = {
    caseStatus: prisma.caseStatus,
    caseType: prisma.caseType,
    claimType: prisma.claimType,
    department: prisma.department,
    examinationType: prisma.examinationType,
    examinationTypeBenefit: prisma.examinationTypeBenefit,
    language: prisma.language,
    organizationType: prisma.organizationType,
    role: prisma.role,
    maximumDistanceTravel: prisma.maximumDistanceTravel,
    yearsOfExperience: prisma.yearsOfExperience,
  };
  return modelMap[type];
};

export const createTaxonomy = async (type: TaxonomyType, data: CreateTaxonomyInput) => {
  try {
    const model = getPrismaModel(type);
    
    // Check for unique name constraint (except for examinationTypeBenefit)
    if (type !== 'examinationTypeBenefit' && data.name) {
      const existing = await model.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (existing) {
        throw HttpError.badRequest(`A ${type} with this name already exists`);
      }
    }

    // Special handling for examinationTypeBenefit to only include valid fields
    let createData: any = { ...data };
    if (type === 'examinationTypeBenefit') {
      createData = {
        examinationTypeId: data.examinationTypeId,
        benefit: data.benefit,
      };
    }

    const result = await model.create({
      data: createData,
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error(`Error creating ${type}:`, error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const updateTaxonomy = async (type: TaxonomyType, id: string, data: UpdateTaxonomyInput) => {
  try {
    const model = getPrismaModel(type);

    // Check if record exists
    const existing = await model.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw HttpError.notFound(`${type} not found`);
    }

    // Check for unique name constraint if name is being updated
    if (type !== 'examinationTypeBenefit' && data.name && data.name !== existing.name) {
      const nameExists = await model.findFirst({
        where: {
          name: data.name,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (nameExists) {
        throw HttpError.badRequest(`A ${type} with this name already exists`);
      }
    }

    // Special handling for examinationTypeBenefit to only include valid fields
    let updateData: any = { ...data };
    if (type === 'examinationTypeBenefit') {
      updateData = {};
      if (data.examinationTypeId !== undefined) updateData.examinationTypeId = data.examinationTypeId;
      if (data.benefit !== undefined) updateData.benefit = data.benefit;
    }

    const result = await model.update({
      where: { id },
      data: updateData,
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error(`Error updating ${type}:`, error);
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getTaxonomies = async (type: TaxonomyType): Promise<TaxonomyData[]> => {
  try {
    const model = getPrismaModel(type);
    
    // Special handling for examinationTypeBenefit to include examination type name
    if (type === 'examinationTypeBenefit') {
      const results = await model.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          examinationType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return results.map((item) => ({
        id: item.id,
        examinationTypeId: item.examinationTypeId,
        examinationTypeName: item.examinationType?.name || 'Unknown',
        benefit: item.benefit,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      }));
    }

    const results = await model.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return results.map((item) => ({
      id: item.id,
      ...Object.keys(item).reduce((acc: Record<string, unknown>, key: string) => {
        if (!['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)) {
          acc[key] = item[key as keyof typeof item];
        }
        return acc;
      }, {}),
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const getTaxonomyById = async (type: TaxonomyType, id: string) => {
  try {
    const model = getPrismaModel(type);
    
    const whereClause = {
      id,
      deletedAt: null,
    };

    // Special handling for examinationTypeBenefit
    const include = type === 'examinationTypeBenefit' ? { examinationType: true } : undefined;

    const result = await model.findFirst({
      where: whereClause,
      include,
    });

    if (!result) {
      throw HttpError.notFound(`${type} not found`);
    }

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.internalServerError("Internal server error");
  }
};

// Helper to get examination types for the benefit dropdown
export const getExaminationTypes = async () => {
  try {
    const types = await prisma.examinationType.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return types.map(type => ({
      label: type.name,
      value: type.id,
    }));
  } catch {
    throw HttpError.internalServerError("Internal server error");
  }
};

export const deleteTaxonomy = async (type: TaxonomyType, id: string) => {
  try {
    const model = getPrismaModel(type);

    // Check if record exists
    const existing = await model.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw HttpError.notFound(`${type} not found`);
    }

    // Soft delete - set deletedAt timestamp
    const result = await model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error(`Error deleting ${type}:`, error);
    throw HttpError.internalServerError("Internal server error");
  }
};

const taxonomyService = {
  createTaxonomy,
  updateTaxonomy,
  getTaxonomies,
  getTaxonomyById,
  getExaminationTypes,
  deleteTaxonomy,
};

export default taxonomyService;

