"use server";
import prisma from "@/lib/db";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { HttpError } from "@/utils/httpError";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";

const listAllExaminers = async () => {
  try {
    // Get ALL examiners regardless of status (PENDING, ACCEPTED, REJECTED)
    const examiners = await prisma.examinerProfile.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        medicalLicenseDocument: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        examinerLanguages: {
          include: {
            language: true,
          },
        },
        feeStructure: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out examiners with missing user data
    const validExaminers = examiners.filter(
      (examiner) => examiner.account?.user
    );

    const examinersData = ExaminerDto.toExaminerDataList(validExaminers);

    // Map specialty IDs to exam type names for all examiners
    const mappedData = await mapSpecialtyIdsToNames(examinersData);

    // If any yearsOfIMEExperience looks like a UUID, fetch the actual names from the taxonomy table
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const yearsUuids = new Set<string>();
    
    for (const examiner of validExaminers) {
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
          const originalExaminer = validExaminers[i];
          if (originalExaminer.yearsOfIMEExperience && uuidRegex.test(originalExaminer.yearsOfIMEExperience.replace(/\s/g, ''))) {
            const yearName = yearsMap.get(originalExaminer.yearsOfIMEExperience);
            if (yearName) {
              examinerData.yearsOfIMEExperience = yearName;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch years of experience:", error);
      }
    }

    return mappedData;
  } catch (error) {
    console.error("Error fetching all examiners:", error);
    throw HttpError.fromError(error, "Failed to get examiners");
  }
};

export default listAllExaminers;
