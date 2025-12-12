"use server";

import { S3Client, GetObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "@/constants/variables";

const s3Config: S3ClientConfig = {
  region: ENV.AWS_REGION!,
};

// Add credentials if available (for local development)
if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3Config);

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
