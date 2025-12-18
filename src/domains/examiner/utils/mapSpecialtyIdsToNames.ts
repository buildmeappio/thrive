import * as examinationTypeService from "@/domains/taxonomy/server/examinationType.service";
import { ExaminerData } from "../types/ExaminerData";
import logger from "@/utils/logger";

/**
 * Maps specialty IDs to examination type names for examiner data
 * Handles various UUID formats (with/without spaces, dashes, different cases)
 */
export async function mapSpecialtyIdsToNames(
  examiners: ExaminerData[],
): Promise<ExaminerData[]> {
  // Fetch all examination types to map specialty IDs to names
  const examTypesMap = new Map<string, string>();
  try {
    const examTypes = await examinationTypeService.getExaminationTypes();

    // Create map with all possible ID formats (with/without spaces/dashes, upper/lowercase)
    examTypes.forEach((et) => {
      const id = et.id;
      // Store original ID
      examTypesMap.set(id, et.name);

      // Normalize UUID: remove spaces and dashes, convert to lowercase
      // This handles formats like "bf237fe5-8bb0-4beb" or "Bf237fe5 8bb0 4beb"
      const normalizedId = id.replace(/[\s-]/g, "").toLowerCase();
      examTypesMap.set(normalizedId, et.name);

      // Store with spaces/dashes removed but original case
      const noSpacesOrDashes = id.replace(/[\s-]/g, "");
      examTypesMap.set(noSpacesOrDashes, et.name);

      // Store with spaces/dashes but lowercase
      const lowerCase = id.toLowerCase();
      examTypesMap.set(lowerCase, et.name);

      // Store with dashes replaced by spaces
      const spacesInsteadOfDashes = id.replace(/-/g, " ");
      examTypesMap.set(spacesInsteadOfDashes, et.name);
    });
  } catch (error) {
    logger.error("Failed to fetch examination types:", error);
  }

  // Map specialty IDs to exam type names for all examiners
  return examiners.map((examiner) => {
    if (examiner.specialties && examiner.specialties.length > 0) {
      examiner.specialties = examiner.specialties.map((specialtyId) => {
        // Try exact match first
        if (examTypesMap.has(specialtyId)) {
          return examTypesMap.get(specialtyId)!;
        }

        // Try normalized match (remove spaces/dashes and convert to lowercase)
        const normalizedId = specialtyId.replace(/[\s-]/g, "").toLowerCase();
        if (examTypesMap.has(normalizedId)) {
          return examTypesMap.get(normalizedId)!;
        }

        // Try with spaces/dashes removed but original case
        const noSpacesOrDashes = specialtyId.replace(/[\s-]/g, "");
        if (examTypesMap.has(noSpacesOrDashes)) {
          return examTypesMap.get(noSpacesOrDashes)!;
        }

        // Try lowercase version
        const lowerCase = specialtyId.toLowerCase();
        if (examTypesMap.has(lowerCase)) {
          return examTypesMap.get(lowerCase)!;
        }

        // Try with dashes replaced by spaces
        const spacesInsteadOfDashes = specialtyId.replace(/-/g, " ");
        if (examTypesMap.has(spacesInsteadOfDashes)) {
          return examTypesMap.get(spacesInsteadOfDashes)!;
        }

        // Fallback to ID if not found
        return specialtyId;
      });
    }
    return examiner;
  });
}
