import caseService from "../case.service";
import { CaseDto } from "../dto/case.dto";
import { generatePresignedUrl } from "@/lib/s3";

const getCaseById = async (id: string, userId: string) => {
  const casee = await caseService.getCaseById(id);
  await caseService.doesCaseBelongToUser(casee, userId);
  const caseDetails = await CaseDto.toCaseDetailDto(casee);

  // Generate presigned URLs for each document
  if (caseDetails.case.documents && caseDetails.case.documents.length > 0) {
    const documentsWithUrls = await Promise.all(
      caseDetails.case.documents.map(async (document) => {
        try {
          const url = await generatePresignedUrl(document.name, 3600); // 1 hour expiration
          return { ...document, url };
        } catch (error) {
          console.error(`Failed to generate presigned URL for document ${document.name}:`, error);
          return { ...document, url: null };
        }
      })
    );
    caseDetails.case.documents = documentsWithUrls;
  }

  return caseDetails;
};

export default getCaseById;
