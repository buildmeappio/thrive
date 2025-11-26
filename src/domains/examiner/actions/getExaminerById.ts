"use server";
import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { generatePresignedUrl } from "@/lib/s3";
import { mapSpecialtyIdsToNames } from "../utils/mapSpecialtyIdsToNames";
import { Decimal } from '@prisma/client/runtime/library';

// Helper function to serialize Decimals and other non-plain objects
const serializeValue = (value: any): any => {
  if (value instanceof Decimal) {
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
  let examinerData = ExaminerDto.toExaminerData(examiner);

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
        console.error("Failed to fetch years of experience:", error);
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
      console.error(`Failed to generate presigned URL for CV:`, error);
    }
  }

  if (examiner.medicalLicenseDocument) {
    try {
      examinerData.medicalLicenseUrl = await generatePresignedUrl(
        `examiner/${examiner.medicalLicenseDocument.name}`,
        3600
      );
    } catch (error) {
      console.error(
        `Failed to generate presigned URL for medical license:`,
        error
      );
    }
  }

  if (examiner.insuranceDocument) {
    try {
      examinerData.insuranceProofUrl = await generatePresignedUrl(
        `examiner/${examiner.insuranceDocument.name}`,
        3600
      );
    } catch (error) {
      console.error(
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
      console.error(`Failed to generate presigned URL for NDA:`, error);
    }
  }

  // Serialize all Decimal fields and other non-plain objects before returning
  return serializeValue(examinerData);
};

export default getExaminerById;