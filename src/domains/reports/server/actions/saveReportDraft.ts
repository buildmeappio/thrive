"use server";

import saveReportDraftHandler, {
  type SaveReportDraftInput,
} from "../handlers/saveReportDraft";
import { SaveReportDraftResponse } from "../../types";
import { uploadFileToS3 } from "@/lib/s3";

export async function saveReportDraftAction(
  input: SaveReportDraftInput
): Promise<SaveReportDraftResponse> {
  try {
    // Upload any new documents first
    const updatedDocuments = await Promise.all(
      input.reportData.referralDocuments.map(async (doc) => {
        if (doc.file && doc.file instanceof File) {
          // Upload to S3 and create document record
          const uploadResult = await uploadFileToS3(doc.file);
          if (uploadResult.success) {
            return {
              ...doc,
              id: uploadResult.document.id,
              name: uploadResult.document.name,
              displayName: doc.file.name,
              size: uploadResult.document.size,
              type: uploadResult.document.type,
              file: undefined, // Remove file after upload
            };
          } else {
            // Upload failed, return error
            throw new Error(
              `Failed to upload document ${doc.file.name}: ${uploadResult.error}`
            );
          }
        }
        // Document already exists, return as-is
        return doc;
      })
    );

    // Update report data with uploaded documents
    const reportDataWithUploadedDocs = {
      ...input.reportData,
      referralDocuments: updatedDocuments,
    };

    const result = await saveReportDraftHandler({
      ...input,
      reportData: reportDataWithUploadedDocs,
    });

    return result;
  } catch (error: unknown) {
    console.error("Error in saveReportDraft action:", error);
    return {
      success: false,
      message: error.message || "Failed to save report draft",
    };
  }
}

export default saveReportDraftAction;

