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
      ContentType: "text/html",
    })
  );

  return key;
}

// Update contract status and store signed PDF info
export async function updateContractStatus(
  contractId: string,
  status: "SIGNED",
  signedPdfBuffer?: Buffer
) {
  const data: any = { status, signedAt: new Date() };

  if (signedPdfBuffer) {
    const pdfKey = `signed-contracts/${contractId}/${crypto.randomUUID()}.pdf`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: pdfKey,
        Body: signedPdfBuffer,
        ContentType: "application/pdf",
      })
    );

    // Calculate SHA256
    const pdfSha256 = crypto
      .createHash("sha256")
      .update(signedPdfBuffer)
      .digest("hex");

    data.signedPdfS3Key = pdfKey;
    data.signedPdfSha256 = pdfSha256;
  }

  return prisma.contract.update({
    where: { id: contractId },
    data,
  });
}
