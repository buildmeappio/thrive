"use server";

import { getPresignedUrlFromS3 } from "@/lib/s3";

export const getExaminerDocumentPresignedUrlAction = async (
  documentName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!documentName) {
      return {
        success: false,
        error: "Document name is required",
      };
    }

    // Use the existing s3 utility function that handles documents/examiner/ path
    const result = await getPresignedUrlFromS3(documentName, 3600); // 1 hour expiry

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error: unknown) {
    console.error("Error in getExaminerDocumentPresignedUrl action:", error);
    return {
      success: false,
      error: (error instanceof Error ? error.message : undefined) || "Failed to generate presigned URL",
    };
  }
};
