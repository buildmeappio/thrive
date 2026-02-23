"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "@/constants/variables";
import s3Client from "@/lib/s3-client";

export const getContractPresignedUrlAction = async (
  s3Key: string,
  forceDownload: boolean = true,
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    if (!s3Key) {
      return {
        success: false,
        error: "S3 key is required",
      };
    }

    const command = new GetObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: s3Key,
      // Add Content-Disposition header to force download
      ...(forceDownload && {
        ResponseContentDisposition: 'attachment; filename="Contract.pdf"',
      }),
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry

    return {
      success: true,
      url,
    };
  } catch (error: unknown) {
    console.error("Error in getContractPresignedUrl action:", error);
    return {
      success: false,
      error:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to generate presigned URL",
    };
  }
};
