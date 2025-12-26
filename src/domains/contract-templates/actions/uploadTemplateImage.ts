"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { uploadToS3 } from "@/lib/s3";
import { getS3FileUrl } from "@/lib/s3";
import { ActionResult } from "../types/contractTemplate.types";

export type UploadTemplateImageInput = {
  fileName: string;
  base64Data: string; // Base64 encoded image data
  contentType: string;
};

export const uploadTemplateImageAction = async (
  input: UploadTemplateImageInput,
): Promise<ActionResult<{ url: string; s3Key: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.fileName) {
      return { success: false, error: "File name is required" };
    }

    if (!input.base64Data) {
      return { success: false, error: "Image data is required" };
    }

    // Validate content type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(input.contentType)) {
      return {
        success: false,
        error: "Invalid image type. Allowed: JPEG, PNG, GIF, WebP, SVG",
      };
    }

    // Remove base64 prefix if present (e.g., "data:image/png;base64,")
    const base64Clean = input.base64Data.replace(
      /^data:image\/[a-z+]+;base64,/,
      "",
    );

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Clean, "base64");

    // Limit file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return {
        success: false,
        error: "Image size exceeds 5MB limit",
      };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${input.fileName}`;

    // Upload to S3 in template-images folder
    const s3Key = await uploadToS3(
      buffer,
      uniqueFileName,
      input.contentType,
      "template-images",
    );

    // Get presigned URL for the uploaded image
    const url = await getS3FileUrl(s3Key);

    return {
      success: true,
      data: {
        url,
        s3Key,
      },
    };
  } catch (error) {
    console.error("Error uploading template image:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload image",
    };
  }
};

