"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import prisma from "@/lib/db";
import { ContractStatus } from "@thrive/database";
import { ENV } from "@/constants/variables";
import s3Client from "@/lib/s3-client";
// S3 client – credentials auto-resolved from env or IAM role

// Upload HTML content to S3
export async function uploadHtmlToS3(contractId: string, htmlContent: string) {
  const buffer = Buffer.from(htmlContent, "utf-8");
  const key = `signed-contracts/${contractId}/${crypto.randomUUID()}.html`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: "text/html; charset=utf-8",
    }),
  );

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    key,
    sha256,
  };
}

// Upload PDF content to S3
export async function uploadPdfToS3(contractId: string, pdfBuffer: Buffer) {
  // Validate that this is actually a PDF (should start with "%PDF")
  if (pdfBuffer.length < 4) {
    throw new Error("PDF buffer is too small");
  }

  const header = pdfBuffer.slice(0, 4).toString("ascii");
  if (header !== "%PDF") {
    // Check if it's a PNG (common mistake - signature image instead of PDF)
    const pngHeader = pdfBuffer.slice(0, 8).toString("ascii");
    if (
      pngHeader === "\x89PNG\r\n\x1a\n" ||
      pdfBuffer.slice(0, 4).toString("hex") === "89504e47"
    ) {
      throw new Error(
        "Invalid PDF: Received PNG image instead of PDF. The client should generate a PDF from the HTML contract, not send the signature image.",
      );
    }
    throw new Error(
      `Invalid PDF format. Header: "${header}" (expected: "%PDF"). File might be corrupted or wrong format.`,
    );
  }

  const key = `signed-contracts/${contractId}/${crypto.randomUUID()}.pdf`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET!,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
    }),
  );

  const sha256 = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

  console.log(
    `✅ PDF uploaded to S3: ${key}, size: ${pdfBuffer.length} bytes, header: ${header}`,
  );

  return {
    key,
    sha256,
  };
}

interface UpdateContractStatusOptions {
  signedPdfBuffer?: Buffer;
  signedHtmlKey?: string;
  signedHtmlSha256?: string;
  signedPdfKey?: string;
  signedPdfSha256?: string;
  unsignedHtmlKey?: string;
  unsignedHtmlSha256?: string;
}

// Update contract status and store signed PDF/HTML info
export async function updateContractStatus(
  contractId: string,
  status: "SIGNED",
  options?: UpdateContractStatusOptions,
) {
  const data: {
    status: ContractStatus;
    signedAt: Date;
    signedPdfS3Key?: string;
    signedPdfSha256?: string;
    signedHtmlS3Key?: string;
    signedHtmlSha256?: string;
    unsignedHtmlS3Key?: string;
    unsignedHtmlSha256?: string;
  } = { status: status as ContractStatus, signedAt: new Date() };

  // Handle signed PDF upload if buffer is provided
  if (options?.signedPdfBuffer) {
    const pdfUpload = await uploadPdfToS3(contractId, options.signedPdfBuffer);
    data.signedPdfS3Key = pdfUpload.key;
    data.signedPdfSha256 = pdfUpload.sha256;
  }

  // Handle signed PDF key and hash if provided directly
  if (options?.signedPdfKey) {
    data.signedPdfS3Key = options.signedPdfKey;
  }
  if (options?.signedPdfSha256) {
    data.signedPdfSha256 = options.signedPdfSha256;
  }

  // Handle signed HTML
  if (options?.signedHtmlKey) {
    data.signedHtmlS3Key = options.signedHtmlKey;
  }
  if (options?.signedHtmlSha256) {
    data.signedHtmlSha256 = options.signedHtmlSha256;
  }

  // Handle unsigned HTML
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
