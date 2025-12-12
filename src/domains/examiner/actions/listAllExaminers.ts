"use server";
import prisma from "@/lib/db";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { HttpError } from "@/utils/httpError";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";
import logger from "@/utils/logger";

const listAllExaminers = async () => {
  try {
    // Get only ACTIVE examiners (those with accounts and ACTIVE status)
    // When examiner creates password, ExaminerProfile status is set to ACTIVE
    const examiners = await prisma.examinerProfile.findMany({
      where: {
        deletedAt: null,
        account: {
          deletedAt: null, // Only examiners with non-deleted accounts
        },
        OR: [
          {
            // Primary: Examiners with ACTIVE status (set when account is created)
            status: "ACTIVE",
          },
          {
            // Fallback: Examiners with linked application that has ACTIVE status
            application: {
              status: "ACTIVE",
              deletedAt: null,
            },
          },
          {
            // Legacy: Examiners without linked application (they're active examiners)
            applicationId: null,
          },
        ],
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        address: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        redactedIMEReportDocument: true,
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
        application: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out examiners with missing user data
    const validExaminers = examiners.filter(
      (examiner) => examiner.account?.user,
    );

    const examinersData = ExaminerDto.toExaminerDataList(validExaminers);

    // Map specialty IDs to exam type names for all examiners
    const mappedData = await mapSpecialtyIdsToNames(examinersData);

    // If any yearsOfIMEExperience looks like a UUID, fetch the actual names from the taxonomy table
    const uuidRegex =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const yearsUuids = new Set<string>();

    for (const examiner of validExaminers) {
      if (
        examiner.yearsOfIMEExperience &&
        uuidRegex.test(examiner.yearsOfIMEExperience.replace(/\s/g, ""))
      ) {
        yearsUuids.add(examiner.yearsOfIMEExperience);
      }
    }

    if (yearsUuids.size > 0) {
      try {
        const yearsOfExperienceRecords =
          await prisma.yearsOfExperience.findMany({
            where: { id: { in: Array.from(yearsUuids) } },
          });

        const yearsMap = new Map(
          yearsOfExperienceRecords.map((y) => [y.id, y.name]),
        );

        for (let i = 0; i < mappedData.length; i++) {
          const examinerData = mappedData[i];
          const originalExaminer = validExaminers[i];
          if (
            originalExaminer.yearsOfIMEExperience &&
            uuidRegex.test(
              originalExaminer.yearsOfIMEExperience.replace(/\s/g, ""),
            )
          ) {
            const yearName = yearsMap.get(
              originalExaminer.yearsOfIMEExperience,
            );
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
    for (const examiner of validExaminers) {
      if (examiner.assessmentTypes) {
        examiner.assessmentTypes.forEach((typeId) => {
          if (uuidRegex.test(typeId.replace(/\s/g, ""))) {
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
            deletedAt: null,
          },
        });

        const typeMap = new Map(examTypes.map((t) => [t.id, t.name]));

        for (let i = 0; i < mappedData.length; i++) {
          const examinerData = mappedData[i];
          const originalExaminer = validExaminers[i];
          if (
            originalExaminer.assessmentTypes &&
            originalExaminer.assessmentTypes.length > 0
          ) {
            examinerData.assessmentTypes = originalExaminer.assessmentTypes.map(
              (id) => typeMap.get(id) || id,
            );
          }
        }
      } catch (error) {
        logger.error("Failed to map assessment types:", error);
      }
    }

    return mappedData;
  } catch (error) {
    logger.error("Error fetching all examiners:", error);
    throw HttpError.fromError(error, "Failed to get examiners");
  }
};

export default listAllExaminers;
