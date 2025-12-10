"use server";
import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { generatePresignedUrl } from "@/lib/s3";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";
import logger from "@/utils/logger";
import { Prisma } from "@prisma/client";

// Helper function to serialize Decimals and other non-plain objects
const serializeValue = (value: any): any => {
  if (value instanceof Prisma.Decimal) {
    return Number(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, serializeValue(val)])
    );
  }
  return value;
};

const getExaminerById = async (id: string) => {
  const examiner = await examinerService.getExaminerById(id);
  let examinerData = ExaminerDto.toExaminerData(examiner as any);

  // Map specialty IDs to exam type names
  const mappedData = await mapSpecialtyIdsToNames([examinerData]);
  examinerData = mappedData[0];

  // If yearsOfIMEExperience looks like a UUID, fetch the actual name from the taxonomy table
  if (examiner.yearsOfIMEExperience) {
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    if (uuidRegex.test(examiner.yearsOfIMEExperience.replace(/\s/g, ''))) {
      try {
        const { default: prisma } = await import("@/lib/db");
        const yearsOfExperience = await prisma.yearsOfExperience.findUnique({
          where: { id: examiner.yearsOfIMEExperience },
        });
        if (yearsOfExperience) {
          examinerData.yearsOfIMEExperience = yearsOfExperience.name;
        }
      } catch (error) {
        logger.error("Failed to fetch years of experience:", error);
      }
    }
  }

  if (examiner.resumeDocument) {
    try {
      examinerData.cvUrl = await generatePresignedUrl(
        `examiner/${examiner.resumeDocument.name}`,
        3600
      );
    } catch (error) {
      logger.error(`Failed to generate presigned URL for CV:`, error);
    }
  }

  // Fetch multiple verification documents using IDs array
  if (examiner.medicalLicenseDocumentIds && examiner.medicalLicenseDocumentIds.length > 0) {
    try {
      const { default: prisma } = await import("@/lib/db");
      const documents = await prisma.documents.findMany({
        where: {
          id: { in: examiner.medicalLicenseDocumentIds },
          deletedAt: null,
        },
      });

      // Generate presigned URLs for all documents
      const urls = await Promise.all(
        documents.map(async (doc) => {
          try {
            return await generatePresignedUrl(`examiner/${doc.name}`, 3600);
          } catch (error) {
            logger.error(`Failed to generate presigned URL for document ${doc.id}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed URLs and set both single and array
      const validUrls = urls.filter((url): url is string => url !== null);
      examinerData.medicalLicenseUrls = validUrls;
      examinerData.medicalLicenseUrl = validUrls[0] || undefined; // Set first URL for backward compatibility
    } catch (error) {
      logger.error("Failed to fetch verification documents:", error);
    }
  }

  if (examiner.insuranceDocument) {
    try {
      examinerData.insuranceProofUrl = await generatePresignedUrl(
        `examiner/${examiner.insuranceDocument.name}`,
        3600
      );
    } catch (error) {
      logger.error(
        `Failed to generate presigned URL for insurance proof:`,
        error
      );
    }
  }

  if (examiner.ndaDocument) {
    try {
      examinerData.signedNdaUrl = await generatePresignedUrl(
        `examiner/${examiner.ndaDocument.name}`,
        3600
      );
    } catch (error) {
      logger.error(`Failed to generate presigned URL for NDA:`, error);
    }
  }

  if (examiner.redactedIMEReportDocument) {
    try {
      examinerData.redactedIMEReportUrl = await generatePresignedUrl(
        `examiner/${examiner.redactedIMEReportDocument.name}`,
        3600
      );
    } catch (error) {
      logger.error(`Failed to generate presigned URL for redacted IME report:`, error);
    }
  }

  // Map assessment types if they are UUIDs to assessment type names
  if (examiner.assessmentTypes && examiner.assessmentTypes.length > 0) {
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    const assessmentTypeIds = examiner.assessmentTypes.filter(id => 
      uuidRegex.test(id.replace(/\s/g, ''))
    );
    
    if (assessmentTypeIds.length > 0) {
      try {
        const { default: prisma } = await import("@/lib/db");
        const assessmentTypes = await prisma.assessmentType.findMany({
          where: { 
            id: { in: assessmentTypeIds },
            deletedAt: null 
          },
        });
        
        const typeMap = new Map(assessmentTypes.map(t => [t.id, t.name]));
        examinerData.assessmentTypes = examiner.assessmentTypes.map(id => 
          typeMap.get(id) || id
        );
      } catch (error) {
        logger.error("Failed to map assessment types:", error);
      }
    }
  }

  // Serialize all Decimal fields and other non-plain objects before returning
  return serializeValue(examinerData);
};

export default getExaminerById;