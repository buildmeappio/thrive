"use server";

import submitReportHandler, {
  type SubmitReportInput,
} from "../handlers/submitReport";
import { SubmitReportResponse } from "../../types";
import { uploadFileToS3 } from "@/lib/s3";

export async function submitReportAction(
  input: SubmitReportInput
): Promise<SubmitReportResponse> {
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

    const result = await submitReportHandler({
      ...input,
      reportData: reportDataWithUploadedDocs,
    });

    return result;
  } catch (error: any) {
    console.error("Error in submitReport action:", error);
    return {
      success: false,
      message: error.message || "Failed to submit report",
    };
  }
}

export default submitReportAction;

