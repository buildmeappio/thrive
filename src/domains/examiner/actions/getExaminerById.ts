"use server";
import examinerService from "../server/examiner.service";
import { ExaminerDto } from "../server/dto/examiner.dto";
import { generatePresignedUrl } from "@/lib/s3";

const getExaminerById = async (id: string) => {
  const examiner = await examinerService.getExaminerById(id);
  const examinerData = ExaminerDto.toExaminerData(examiner);

  // Generate presigned URLs for documents
  if (examiner.resumeDocument) {
    try {
      examinerData.cvUrl = await generatePresignedUrl(examiner.resumeDocument.name, 3600);
    } catch (error) {
      console.error(`Failed to generate presigned URL for CV:`, error);
    }
  }

  if (examiner.medicalLicenseDocument) {
    try {
      examinerData.medicalLicenseUrl = await generatePresignedUrl(examiner.medicalLicenseDocument.name, 3600);
    } catch (error) {
      console.error(`Failed to generate presigned URL for medical license:`, error);
    }
  }

  if (examiner.insuranceDocument) {
    try {
      examinerData.insuranceProofUrl = await generatePresignedUrl(examiner.insuranceDocument.name, 3600);
    } catch (error) {
      console.error(`Failed to generate presigned URL for insurance proof:`, error);
    }
  }

  if (examiner.ndaDocument) {
    try {
      examinerData.signedNdaUrl = await generatePresignedUrl(examiner.ndaDocument.name, 3600);
    } catch (error) {
      console.error(`Failed to generate presigned URL for NDA:`, error);
    }
  }

  return examinerData;
};

export default getExaminerById;

