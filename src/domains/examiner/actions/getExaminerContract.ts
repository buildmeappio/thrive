"use server";

import prisma from "@/lib/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import logger from "@/utils/logger";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

async function streamToString(body: any): Promise<string> {
  if (!body) return "";
  if (typeof body.transformToString === "function") {
    return body.transformToString();
  }
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    body.on("data", (chunk: Buffer) => chunks.push(chunk));
    body.on("error", reject);
    body.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

/**
 * Get the latest contract HTML for an examiner or application (for admin review)
 */
export async function getExaminerContract(id: string, isApplication: boolean = false) {
  try {
    // Get the latest contract for this examiner or application
    const contract = await prisma.contract.findFirst({
      where: isApplication
        ? {
            applicationId: id,
          }
        : {
            examinerProfileId: id,
          },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!contract) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    // Fetch HTML content from S3 (use signed if available, otherwise unsigned)
    let contractHtml: string | null = null;
    const htmlKey = contract.signedHtmlS3Key || contract.unsignedHtmlS3Key;
    
    if (htmlKey) {
      try {
        const htmlCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: htmlKey,
        });
        const htmlResponse = await s3Client.send(htmlCommand);
        contractHtml = await streamToString(htmlResponse.Body);
      } catch (error) {
        logger.error("Error fetching contract HTML from S3:", error);
      }
    }

    return {
      success: true,
      contractHtml,
      contractId: contract.id,
      status: contract.status,
      data: contract.data,
    };
  } catch (error) {
    logger.error("Error fetching examiner contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch contract",
    };
  }
}

export default getExaminerContract;

