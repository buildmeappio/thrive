import { HttpError } from '@/utils/httpError';
import { CreateTaxonomyInput, UpdateTaxonomyInput, TaxonomyData, TaxonomyType } from '../types/Taxonomy';
import prisma from '@/lib/db';
import logger from "@/utils/logger";

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
    configuration: prisma.configuration,
    assessmentType: prisma.assessmentType,
  };
  return modelMap[type];
};

// Helper function to parse value as number (NO timezone conversion)
// The client already converted to UTC minutes before sending
const parseValueAsNumber = (value: string | number): number => {
  try {
    // If it's already a number, return it as-is
    if (typeof value === 'number') {
      return value;
    }

    const stringValue = String(value).trim();

    // Parse numeric string (e.g., "480", "780")
    if (/^\d+$/.test(stringValue)) {
      return parseInt(stringValue, 10);
    }

    throw new Error(`Invalid numeric value: ${stringValue}`);
  } catch (error) {
    logger.error(`Error parsing value as number: ${error}`);
    throw new Error('Failed to parse value as number');
  }
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
    } else if (type === 'configuration') {
      // Convert value from string to number for configuration
      // Special handling for time-related configurations
      if (data.name === 'start_working_hour_time') {
        // Client already converted to UTC minutes, just parse as number
        try {
          createData = {
            name: data.name,
            value: parseValueAsNumber(data.value),
          };
        } catch (error) {
          logger.error('Error parsing value:', error);
          throw HttpError.badRequest('Invalid value. Please provide a valid number.');
        }
      } else {
        createData = {
          name: data.name,
          value: typeof data.value === 'string' ? parseInt(data.value, 10) : data.value,
        };
        if (isNaN(createData.value)) {
          throw HttpError.badRequest('Value must be a valid number');
        }
      }
    }

    const result = await model.create({
      data: createData,
    });

    return result;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    logger.error(`Error creating ${type}:`, error);
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
    } else if (type === 'configuration') {
      // Convert value from string to number for configuration
      updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.value !== undefined) {
        // Special handling for time-related configurations
        const configName = data.name !== undefined ? data.name : existing.name;
        if (configName === 'start_working_hour_time') {
          // Client already converted to UTC minutes, just parse as number
          try {
            updateData.value = parseValueAsNumber(data.value);
          } catch (error) {
            logger.error('Error parsing value:', error);
            throw HttpError.badRequest('Invalid value. Please provide a valid number.');
          }
        } else {
          const numValue = typeof data.value === 'string' ? parseInt(data.value, 10) : data.value;
          if (isNaN(numValue) || typeof numValue !== 'number') {
            throw HttpError.badRequest('Value must be a valid number');
          }
          updateData.value = numValue;
        }
      }
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
    logger.error(`Error updating ${type}:`, error);
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

      case 'configuration': {
        // Configuration has no relations, so frequency is always 0
        // No need to query anything
        break;
      }

      case 'assessmentType': {
        // Count usage in ExaminerApplication and ExaminerProfile assessmentTypes arrays
        const assessmentTypeIds = items.map(item => item.id);
        
        // Count in ExaminerApplication
        const applications = await prisma.examinerApplication.findMany({
          where: {
            deletedAt: null,
          },
          select: {
            assessmentTypeIds: true,
          },
        });

        // Count in ExaminerProfile
        const profiles = await prisma.examinerProfile.findMany({
          where: {
            deletedAt: null,
          },
          select: {
            assessmentTypes: true,
          },
        });

        // Count occurrences in both arrays
        assessmentTypeIds.forEach(id => {
          let count = 0;
          
          // Count in applications
          applications.forEach(app => {
            if (app.assessmentTypeIds.includes(id)) {
              count++;
            }
          });
          
          // Count in profiles
          profiles.forEach(profile => {
            if (profile.assessmentTypes.includes(id)) {
              count++;
            }
          });
          
          frequencyMap.set(id, count);
        });
        break;
      }

      default:
        break;
    }
  } catch (error) {
    logger.error(`Error getting frequency counts for ${type}:`, error);
  }

  // Ensure all items have a frequency (default to 0 if not found)
  items.forEach(item => {
    if (!frequencyMap.has(item.id)) {
      frequencyMap.set(item.id, 0);
    }
  });

  return frequencyMap;
};

// Helper function to check if a string is a UUID (handles spaces and variations)
const isUUID = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  
  const trimmed = str.trim();
  if (!trimmed) return false;
  
  // Remove all spaces, hyphens, and convert to lowercase
  const cleaned = trimmed.replace(/[\s-]/g, '').toLowerCase();
  
  // UUIDs are exactly 32 hexadecimal characters
  // Check if it's exactly 32 hex characters (most reliable check)
  if (cleaned.length === 32 && /^[0-9a-f]{32}$/i.test(cleaned)) {
    return true;
  }
  
  // Also check for standard UUID format with hyphens
  const standardUUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (standardUUIDRegex.test(cleaned)) {
    return true;
  }
  
  // Check if the string contains mostly hex characters and looks like a UUID
  // Count hex characters - UUIDs have exactly 32 hex chars
  const hexChars = trimmed.match(/[0-9a-f]/gi);
  const hexCharCount = hexChars ? hexChars.length : 0;
  
  // If it has exactly 32 hex characters (allowing for spaces/hyphens), it's a UUID
  if (hexCharCount === 32) {
    // Double check it's not a valid language name by checking if it's all hex
    const nonHexChars = trimmed.match(/[^0-9a-f\s-]/gi);
    if (!nonHexChars || nonHexChars.length === 0) {
      return true;
    }
  }
  
  return false;
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

    // Special handling for language to filter out UUIDs and remove duplicates
    if (type === 'language') {
      const results = await model.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Step 1: Filter out languages with UUID names completely (don't show them at all)
      const languagesWithNormalNames = results.filter(item => {
        const name = item.name?.trim();
        if (!name) return false;
        return !isUUID(name);
      });

      // Step 2: Get frequency counts for ALL languages (including duplicates) before deduplication
      const allFrequencyMap = await getFrequencyCounts(
        type,
        languagesWithNormalNames.map(item => ({ id: item.id, name: item.name }))
      );

      // Step 3: Aggregate frequencies by normalized name and keep the most recent language
      const nameToLanguageMap = new Map<string, { language: typeof results[0]; totalFrequency: number }>();
      
      languagesWithNormalNames.forEach(item => {
        const normalizedName = item.name.trim().toLowerCase();
        const frequency = allFrequencyMap.get(item.id) ?? 0;
        
        const existing = nameToLanguageMap.get(normalizedName);
        if (existing) {
          // Duplicate found - aggregate frequency and keep the most recent (already sorted)
          existing.totalFrequency += frequency;
          // Don't update the language object since we want to keep the first (most recent) one
        } else {
          // First occurrence of this name - keep it
          nameToLanguageMap.set(normalizedName, {
            language: item,
            totalFrequency: frequency,
          });
        }
      });

      // Step 4: Convert map to array and return unique languages with aggregated frequencies
      return Array.from(nameToLanguageMap.values()).map(({ language, totalFrequency }) => {
        return {
          id: language.id,
          ...Object.keys(language).reduce((acc: Record<string, unknown>, key: string) => {
            if (!['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)) {
              acc[key] = language[key as keyof typeof language];
            }
            return acc;
          }, {}),
          frequency: totalFrequency,
          createdAt: language.createdAt instanceof Date ? language.createdAt.toISOString() : language.createdAt,
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
    logger.error(`Error getting taxonomies for ${type}:`, error);
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
    logger.error(`Error deleting ${type}:`, error);
    throw HttpError.internalServerError("Internal server error");
  }
};
