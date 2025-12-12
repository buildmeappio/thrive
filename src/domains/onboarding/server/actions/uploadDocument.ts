"use server";

import { uploadFileToS3 } from "@/lib/s3";

export type UploadDocumentResponse =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      data: {
        id: string;
        name: string;
        originalName: string;
        size: number;
        type: string;
        url?: string;
      };
    };

export const uploadDocumentAction = async (
  file: File,
): Promise<UploadDocumentResponse> => {
  try {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (file.size > maxSize) {
      return {
        success: false,
        message: `File size exceeds maximum of 10 MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "Only PDF, JPG, and PNG files are allowed",
      };
    }

    // Upload file to S3
    const uploadResult = await uploadFileToS3(file);

    if (!uploadResult.success) {
      return {
        success: false,
        message: uploadResult.error || "Failed to upload document",
      };
    }

    // Construct CDN URL if configured
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL
      ? `${process.env.NEXT_PUBLIC_CDN_URL}/documents/examiner/${uploadResult.document.name}`
      : undefined;

    return {
      success: true,
      data: {
        id: uploadResult.document.id,
        name: uploadResult.document.name,
        originalName: file.name,
        size: uploadResult.document.size,
        type: uploadResult.document.type,
        url: cdnUrl,
      },
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
