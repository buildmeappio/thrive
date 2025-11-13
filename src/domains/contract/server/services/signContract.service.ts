"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import prisma from "@/lib/db";

// S3 client – credentials auto-resolved from env or IAM role
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// Upload HTML content to S3
export async function uploadHtmlToS3(contractId: string, htmlContent: string) {
  const buffer = Buffer.from(htmlContent, "utf-8");
  const key = `signed-contracts/${contractId}/${crypto.randomUUID()}.html`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: "text/html; charset=utf-8",
    })
  );

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    key,
    sha256,
  };
}

interface UpdateContractStatusOptions {
  signedPdfBuffer?: Buffer;
  signedHtmlKey?: string;
  signedHtmlSha256?: string;
  unsignedHtmlKey?: string;
  unsignedHtmlSha256?: string;
}

// Update contract status and store signed PDF/HTML info
export async function updateContractStatus(
  contractId: string,
  status: "SIGNED",
  options?: UpdateContractStatusOptions
) {
  const data: any = { status, signedAt: new Date() };

  if (options?.signedPdfBuffer) {
    const pdfKey = `signed-contracts/${contractId}/${crypto.randomUUID()}.pdf`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: pdfKey,
        Body: options?.signedPdfBuffer,
        ContentType: "application/pdf",
      })
    );

    const pdfSha256 = crypto
      .createHash("sha256")
      // .update(options.signedPdfBuffer)
      .digest("hex");

    data.signedPdfS3Key = pdfKey;
    data.signedPdfSha256 = pdfSha256;
  }

  if (options?.signedHtmlKey) {
    data.signedHtmlS3Key = options.signedHtmlKey;
  }
  if (options?.signedHtmlSha256) {
    data.signedHtmlSha256 = options.signedHtmlSha256;
  }

  if (options?.unsignedHtmlKey) {
    data.unsignedHtmlS3Key = options.unsignedHtmlKey;
  }
  if (options?.unsignedHtmlSha256) {
    data.unsignedHtmlSha256 = options.unsignedHtmlSha256;
  }

  return prisma.contract.update({
    where: { id: contractId },
    data,
  });
}
