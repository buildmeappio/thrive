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

// Helper function to get frequency counts for all taxonomy items of a type (batch query for better performance)
const getFrequencyCounts = async (type: TaxonomyType, items: Array<{ id: string; name: string }>): Promise<Map<string, number>> => {
  const frequencyMap = new Map<string, number>();
  
  if (items.length === 0) return frequencyMap;

  try {
    switch (type) {
      case 'caseType': {
        const caseCounts = await prisma.case.groupBy({
          by: ['caseTypeId'],
          where: {
            caseTypeId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        caseCounts.forEach(count => {
          frequencyMap.set(count.caseTypeId, count._count);
        });
        break;
      }

      case 'caseStatus': {
        const statusCounts = await prisma.examination.groupBy({
          by: ['statusId'],
          where: {
            statusId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        statusCounts.forEach(count => {
          frequencyMap.set(count.statusId, count._count);
        });
        break;
      }

      case 'claimType': {
        const claimCounts = await prisma.claimant.groupBy({
          by: ['claimTypeId'],
          where: {
            claimTypeId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        claimCounts.forEach(count => {
          frequencyMap.set(count.claimTypeId, count._count);
        });
        break;
      }

      case 'department': {
        const departmentCounts = await prisma.organizationManager.groupBy({
          by: ['departmentId'],
          where: {
            departmentId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        departmentCounts.forEach(count => {
          if (count.departmentId) {
            frequencyMap.set(count.departmentId, count._count);
          }
        });
        break;
      }

      case 'examinationType': {
        const examTypeCounts = await prisma.examination.groupBy({
          by: ['examinationTypeId'],
          where: {
            examinationTypeId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        examTypeCounts.forEach(count => {
          frequencyMap.set(count.examinationTypeId, count._count);
        });
        break;
      }

      case 'examinationTypeBenefit': {
        const benefitCounts = await prisma.examinationSelectedBenefit.groupBy({
          by: ['benefitId'],
          where: {
            benefitId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        benefitCounts.forEach(count => {
          frequencyMap.set(count.benefitId, count._count);
        });
        break;
      }

      case 'language': {
        // Count usage in examinerLanguages, interpreterLanguages, and examinationInterpreter
        const [examinerCounts, interpreterCounts, examinationCounts] = await Promise.all([
          prisma.examinerLanguage.groupBy({
            by: ['languageId'],
            where: {
              languageId: { in: items.map(item => item.id) },
            },
            _count: true,
          }),
          prisma.interpreterLanguage.groupBy({
            by: ['languageId'],
            where: {
              languageId: { in: items.map(item => item.id) },
            },
            _count: true,
          }),
          prisma.examinationInterpreter.groupBy({
            by: ['languageId'],
            where: {
              languageId: { in: items.map(item => item.id) },
              deletedAt: null,
            },
            _count: true,
          }),
        ]);

        // Combine counts for each language
        items.forEach(item => {
          const examinerCount = examinerCounts.find(c => c.languageId === item.id)?._count || 0;
          const interpreterCount = interpreterCounts.find(c => c.languageId === item.id)?._count || 0;
          const examinationCount = examinationCounts.find(c => c.languageId === item.id)?._count || 0;
          frequencyMap.set(item.id, examinerCount + interpreterCount + examinationCount);
        });
        break;
      }

      case 'organizationType': {
        const orgTypeCounts = await prisma.organization.groupBy({
          by: ['typeId'],
          where: {
            typeId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        orgTypeCounts.forEach(count => {
          frequencyMap.set(count.typeId, count._count);
        });
        break;
      }

      case 'role': {
        const roleCounts = await prisma.account.groupBy({
          by: ['roleId'],
          where: {
            roleId: { in: items.map(item => item.id) },
            deletedAt: null,
          },
          _count: true,
        });
        roleCounts.forEach(count => {
          frequencyMap.set(count.roleId, count._count);
        });
        break;
      }

      case 'maximumDistanceTravel': {
        // Count examiner profiles where maxTravelDistance matches the name
        const names = items.map(item => item.name);
        const distanceCounts = await prisma.examinerProfile.groupBy({
          by: ['maxTravelDistance'],
          where: {
            maxTravelDistance: { in: names },
            deletedAt: null,
          },
          _count: true,
        });
        distanceCounts.forEach(count => {
          if (count.maxTravelDistance) {
            // Find the item with matching name
            const matchingItem = items.find(item => item.name === count.maxTravelDistance);
            if (matchingItem) {
              frequencyMap.set(matchingItem.id, count._count);
            }
          }
        });
        break;
      }

      case 'yearsOfExperience': {
        // Count examiner profiles where yearsOfIMEExperience matches the name
        const names = items.map(item => item.name);
        const experienceCounts = await prisma.examinerProfile.groupBy({
          by: ['yearsOfIMEExperience'],
          where: {
            yearsOfIMEExperience: { in: names },
            deletedAt: null,
          },
          _count: true,
        });
        experienceCounts.forEach(count => {
          // Find the item with matching name
          const matchingItem = items.find(item => item.name === count.yearsOfIMEExperience);
          if (matchingItem) {
            frequencyMap.set(matchingItem.id, count._count);
          }
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`Error getting frequency counts for ${type}:`, error);
  }

  // Ensure all items have a frequency (default to 0 if not found)
  items.forEach(item => {
    if (!frequencyMap.has(item.id)) {
      frequencyMap.set(item.id, 0);
    }
  });

  return frequencyMap;
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

      // Get frequency counts in batch
      const frequencyMap = await getFrequencyCounts(
        type,
        results.map(item => ({ id: item.id, name: item.benefit }))
      );

      return results.map((item) => {
        const frequency = frequencyMap.get(item.id) ?? 0;
        return {
          id: item.id,
          examinationTypeId: item.examinationTypeId,
          examinationTypeName: item.examinationType?.name || 'Unknown',
          benefit: item.benefit,
          frequency,
          createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        };
      });
    }

    const results = await model.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get frequency counts in batch
    const frequencyMap = await getFrequencyCounts(
      type,
      results.map(item => ({ id: item.id, name: item.name }))
    );

    return results.map((item) => {
      const frequency = frequencyMap.get(item.id) ?? 0;
      return {
        id: item.id,
        ...Object.keys(item).reduce((acc: Record<string, unknown>, key: string) => {
          if (!['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)) {
            acc[key] = item[key as keyof typeof item];
          }
          return acc;
        }, {}),
        frequency,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      };
    });
  } catch (error) {
    console.error(`Error getting taxonomies for ${type}:`, error);
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

