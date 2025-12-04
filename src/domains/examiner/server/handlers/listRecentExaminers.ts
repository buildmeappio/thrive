import examinerService from "../examiner.service";
import { ExaminerDto } from "../dto/examiner.dto";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { mapSpecialtyIdsToNames } from "../../utils/mapSpecialtyIdsToNames";
import prisma from "@/lib/db";
import logger from "@/utils/logger";

export async function listRecentExaminers(limit = 7): Promise<ExaminerData[]> {
  const examiners = await examinerService.getRecentExaminers(limit, "PENDING");
  const examinersData = ExaminerDto.toExaminerDataList(examiners);

  // Map specialty IDs to exam type names for all examiners
  const mappedData = await mapSpecialtyIdsToNames(examinersData);

  // If any yearsOfIMEExperience looks like a UUID, fetch the actual names from the taxonomy table
  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  const yearsUuids = new Set<string>();
  
  for (const examiner of examiners) {
    if (examiner.yearsOfIMEExperience && uuidRegex.test(examiner.yearsOfIMEExperience.replace(/\s/g, ''))) {
      yearsUuids.add(examiner.yearsOfIMEExperience);
    }
  }

  if (yearsUuids.size > 0) {
    try {
      const yearsOfExperienceRecords = await prisma.yearsOfExperience.findMany({
        where: { id: { in: Array.from(yearsUuids) } },
      });
      
      const yearsMap = new Map(yearsOfExperienceRecords.map(y => [y.id, y.name]));
      
      for (let i = 0; i < mappedData.length; i++) {
        const examinerData = mappedData[i];
        const originalExaminer = examiners[i];
        if (originalExaminer.yearsOfIMEExperience && uuidRegex.test(originalExaminer.yearsOfIMEExperience.replace(/\s/g, ''))) {
          const yearName = yearsMap.get(originalExaminer.yearsOfIMEExperience);
          if (yearName) {
            examinerData.yearsOfIMEExperience = yearName;
          }
        }
      }
    } catch (error) {
      logger.error("Failed to fetch years of experience:", error);
    }
  }

  // Map assessment types if they are UUIDs
  const assessmentTypeUuids = new Set<string>();
  for (const examiner of examiners) {
    if (examiner.assessmentTypes) {
      examiner.assessmentTypes.forEach(typeId => {
        if (uuidRegex.test(typeId.replace(/\s/g, ''))) {
          assessmentTypeUuids.add(typeId);
        }
      });
    }
  }

  if (assessmentTypeUuids.size > 0) {
    try {
      const examTypes = await prisma.examinationType.findMany({
        where: { 
          id: { in: Array.from(assessmentTypeUuids) },
          deletedAt: null 
        },
      });
      
      const typeMap = new Map(examTypes.map(t => [t.id, t.name]));
      
      for (let i = 0; i < mappedData.length; i++) {
        const examinerData = mappedData[i];
        const originalExaminer = examiners[i];
        if (originalExaminer.assessmentTypes && originalExaminer.assessmentTypes.length > 0) {
          examinerData.assessmentTypes = originalExaminer.assessmentTypes.map(id => 
            typeMap.get(id) || id
          );
        }
      }
    } catch (error) {
      logger.error("Failed to map assessment types:", error);
    }
  }

  return mappedData;
}