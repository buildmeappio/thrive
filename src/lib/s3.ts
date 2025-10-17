"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3-client";
import { ENV } from "@/constants/variables";

/**
 * Generate a presigned URL for a document stored in S3
 * @param documentName - The name of the document (stored in the Documents table)
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for accessing the document
 */
export async function generatePresignedUrl(
  documentName: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  try {
    if (!ENV.AWS_S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    // Construct the S3 key - adjust the path based on your S3 structure
    // Looking at the examiner-web implementation, documents are stored in "documents/" prefix
    const s3Key = `documents/${documentName}`;

    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

/**
 * Generate presigned URLs for multiple documents
 * @param documentNames - Array of document names
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Array of presigned URLs in the same order as input
 */
export async function generatePresignedUrls(
  documentNames: string[],
  expiresIn: number = 3600
): Promise<string[]> {
  try {
    const urlPromises = documentNames.map((name) =>
      generatePresignedUrl(name, expiresIn)
    );
    return await Promise.all(urlPromises);
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    throw error;
  }
}

