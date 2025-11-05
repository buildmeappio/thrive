"use server";

import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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

/**
 * Upload a file buffer to S3
 * @param buffer - The file buffer to upload
 * @param fileName - The name to give the file in S3
 * @param contentType - The MIME type of the file
 * @param folder - The S3 folder prefix (default: "contracts")
 * @returns The S3 key of the uploaded file
 */
export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string = "application/pdf",
  folder: string = "contracts"
): Promise<string> {
  try {
    if (!ENV.AWS_S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

    const s3Key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    
    console.log(`✅ File uploaded to S3: ${s3Key}`);
    return s3Key;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

/**
 * Get a public URL for a file stored in S3
 * @param s3Key - The S3 key of the file
 * @param expiresIn - URL expiration time in seconds (default: 7 days)
 * @returns Presigned URL for accessing the file
 */
export async function getS3FileUrl(
  s3Key: string,
  expiresIn: number = 604800 // 7 days default for contracts
): Promise<string> {
  try {
    if (!ENV.AWS_S3_BUCKET) {
      throw new Error("AWS_S3_BUCKET is not configured");
    }

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

