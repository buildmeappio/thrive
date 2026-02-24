'use server';

import prisma from '@/lib/db';
import * as examinationTypeService from '@/domains/taxonomy/server/examinationType.service';
import logger from '@/utils/logger';

export default async function listExaminerSpecialties(): Promise<string[]> {
  const examiners = await prisma.examinerProfile.findMany({
    select: { specialties: true },
  });

  const specialtyIdsSet = new Set<string>();
  examiners.forEach(examiner => {
    if (examiner.specialties) {
      examiner.specialties.forEach(specialty => specialtyIdsSet.add(specialty));
    }
  });

  // Fetch examination types to map specialty IDs to names
  const examTypesMap = new Map<string, string>();
  try {
    const examTypes = await examinationTypeService.getExaminationTypes();

    // Create map with all possible ID formats
    examTypes.forEach(et => {
      const id = et.id;
      examTypesMap.set(id, et.name);

      // Normalize UUID: remove spaces and dashes, convert to lowercase
      const normalizedId = id.replace(/[\s-]/g, '').toLowerCase();
      examTypesMap.set(normalizedId, et.name);

      // Store with spaces/dashes removed but original case
      const noSpacesOrDashes = id.replace(/[\s-]/g, '');
      examTypesMap.set(noSpacesOrDashes, et.name);

      // Store with spaces/dashes but lowercase
      const lowerCase = id.toLowerCase();
      examTypesMap.set(lowerCase, et.name);
    });
  } catch (error) {
    logger.error('Failed to fetch examination types:', error);
  }

  // Map specialty IDs to names
  const specialtyNamesSet = new Set<string>();

  Array.from(specialtyIdsSet).forEach(specialtyId => {
    let specialtyName: string | undefined;

    // Try exact match first
    if (examTypesMap.has(specialtyId)) {
      specialtyName = examTypesMap.get(specialtyId)!;
    }
    // Try normalized match
    else {
      const normalizedId = specialtyId.replace(/[\s-]/g, '').toLowerCase();
      if (examTypesMap.has(normalizedId)) {
        specialtyName = examTypesMap.get(normalizedId)!;
      }
      // Try with spaces/dashes removed but original case
      else {
        const noSpacesOrDashes = specialtyId.replace(/[\s-]/g, '');
        if (examTypesMap.has(noSpacesOrDashes)) {
          specialtyName = examTypesMap.get(noSpacesOrDashes)!;
        }
        // Try lowercase version
        else {
          const lowerCase = specialtyId.toLowerCase();
          if (examTypesMap.has(lowerCase)) {
            specialtyName = examTypesMap.get(lowerCase)!;
          }
          // Fallback to ID if not found
          else {
            specialtyName = specialtyId;
          }
        }
      }
    }

    // Add to set (automatically handles duplicates)
    if (specialtyName) {
      specialtyNamesSet.add(specialtyName.trim());
    }
  });

  // Convert to array and sort
  return Array.from(specialtyNamesSet).sort();
}
