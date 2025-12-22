"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "@/constants/variables";
import s3Client from "@/lib/s3-client";

export const getDocumentPresignedUrlAction = async (
  documentName: string,
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!documentName) {
      return {
        success: false,
        error: "Document name is required",
      };
    }

    // For case documents, use documents/filename instead of documents/examiner/filename
    const key = `documents/${documentName}`;

    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry

    return {
      success: true,
      url,
    };
  } catch (error: unknown) {
    console.error("Error in getDocumentPresignedUrl action:", error);
    return {
      success: false,
      error:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to generate presigned URL",
    };
  }
};