"use server";

import applicationService from "../server/application.service";
import { ApplicationDto } from "../server/dto/application.dto";
import { ExaminerData } from "../types/ExaminerData";
import { HttpError } from "@/utils/httpError";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";
import { generatePresignedUrl } from "@/lib/s3";
import logger from "@/utils/logger";
import prisma from "@/lib/db";

const getApplicationById = async (id: string): Promise<ExaminerData> => {
  try {
    const application = await applicationService.getApplicationById(id);

    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    const applicationData = ApplicationDto.toApplicationData(application);
    const [mappedData] = await mapSpecialtyIdsToNames([applicationData]);

    const uuidRegex =
      /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

    // Map years of IME experience if it's a UUID
    if (
      application.yearsOfIMEExperience &&
      uuidRegex.test(application.yearsOfIMEExperience.replace(/\s/g, ""))
    ) {
      try {
        const yearsOfExperience = await prisma.yearsOfExperience.findUnique({
          where: { id: application.yearsOfIMEExperience },
        });
        if (yearsOfExperience) {
          mappedData.yearsOfIMEExperience = yearsOfExperience.name;
        }
      } catch (error) {
        logger.error("Failed to fetch years of experience:", error);
      }
    }

    // Map assessment types if they are UUIDs
    if (
      application.assessmentTypeIds &&
      application.assessmentTypeIds.length > 0
    ) {
      const assessmentTypeUuids = application.assessmentTypeIds.filter((id) =>
        uuidRegex.test(id.replace(/\s/g, "")),
      );

      if (assessmentTypeUuids.length > 0) {
        try {
          const assessmentTypes = await prisma.assessmentType.findMany({
            where: {
              id: { in: assessmentTypeUuids },
              deletedAt: null,
            },
          });

          const typeMap = new Map(assessmentTypes.map((t) => [t.id, t.name]));
          mappedData.assessmentTypes = application.assessmentTypeIds.map(
            (id) => typeMap.get(id) || id,
          );
        } catch (error) {
          logger.error("Failed to map assessment types:", error);
        }
      }
    }

    // Map languages if they are UUIDs
    if (application.languagesSpoken && application.languagesSpoken.length > 0) {
      const languageUuids = application.languagesSpoken.filter((lang) =>
        uuidRegex.test(lang.replace(/\s/g, "")),
      );

      if (languageUuids.length > 0) {
        try {
          const languages = await prisma.language.findMany({
            where: {
              id: { in: languageUuids },
              deletedAt: null,
            },
          });

          const languageMap = new Map(languages.map((l) => [l.id, l.name]));
          mappedData.languagesSpoken = application.languagesSpoken.map(
            (id) => languageMap.get(id) || id,
          );
        } catch (error) {
          logger.error("Failed to map languages:", error);
        }
      }
    }

    // Fetch multiple verification documents using IDs array
    if (
      application.medicalLicenseDocumentIds &&
      application.medicalLicenseDocumentIds.length > 0
    ) {
      try {
        const documents = await prisma.documents.findMany({
          where: {
            id: { in: application.medicalLicenseDocumentIds },
            deletedAt: null,
          },
        });

        // Generate presigned URLs for all documents
        const urls = await Promise.all(
          documents.map(async (doc) => {
            try {
              return await generatePresignedUrl(`examiner/${doc.name}`, 3600);
            } catch (error) {
              logger.error(
                `Failed to generate presigned URL for document ${doc.id}:`,
                error,
              );
              return null;
            }
          }),
        );

        // Filter out any failed URLs and set both single and array
        const validUrls = urls.filter((url): url is string => url !== null);
        mappedData.medicalLicenseUrls = validUrls;
        mappedData.medicalLicenseUrl = validUrls[0] || undefined; // Set first URL for backward compatibility
      } catch (error) {
        logger.error("Failed to fetch verification documents:", error);
      }
    }

    return mappedData;
  } catch (error) {
    logger.error("Error fetching application by ID:", error);
    throw HttpError.fromError(error, "Failed to get application");
  }
};

export default getApplicationById;
