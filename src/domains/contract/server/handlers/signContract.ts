"use server";

import { revalidatePath } from "next/cache";
import { ContractStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { getLatestContractService } from "../services/getLatestContract.service";
import {
  uploadHtmlToS3,
  uploadPdfToS3,
} from "../services/signContract.service";

export interface SignContractInput {
  contractId: string;
  signerName: string;
  htmlContent: string;
  pdfBase64: string;
  signatureImage?: string; // Signature image as data URL
  ipAddress?: string;
  userAgent?: string;
}

export async function signContractHandler(input: SignContractInput) {
  try {
    if (!input.contractId)
      return { success: false, error: "Contract ID is required" };
    if (!input.signerName)
      return { success: false, error: "Signer name is required" };
    if (!input.htmlContent)
      return { success: false, error: "HTML content is required" };
    if (!input.pdfBase64)
      return { success: false, error: "PDF content is required" };

    const contract = await getLatestContractService(input.contractId);
    if (!contract) return { success: false, error: "Contract not found" };
    if (contract.status !== "SENT" && contract.status !== "VIEWED") {
      return {
        success: false,
        error: `Contract cannot be signed. Current status: ${contract.status}`,
      };
    }

    // Convert base64 PDF to buffer
    const pdfBuffer = Buffer.from(input.pdfBase64, "base64");

    // Upload HTML to S3 (required)
    let htmlUpload: { key: string; sha256: string };
    let pdfUpload: { key: string; sha256: string } | null = null;

    try {
      htmlUpload = await uploadHtmlToS3(input.contractId, input.htmlContent);
    } catch (htmlError: unknown) {
      const errorMessage =
        htmlError instanceof Error ? htmlError.message : "Unknown error";
      return {
        success: false,
        error: `Failed to upload HTML: ${errorMessage}`,
      };
    }

    // Try to upload PDF to S3 (optional - if it fails, we'll still proceed)
    // The email will use the base64 PDF directly anyway
    try {
      pdfUpload = await uploadPdfToS3(input.contractId, pdfBuffer);
      console.log("✅ PDF uploaded to S3 successfully");
    } catch (pdfError: unknown) {
      const errorMessage =
        pdfError instanceof Error ? pdfError.message : "Unknown error";
      console.warn(
        "⚠️ Failed to upload PDF to S3 (contract signing will still proceed):",
        errorMessage,
      );
      console.warn("⚠️ Email will use base64 PDF directly instead");
      // Continue without PDF upload - email will use base64 PDF
    }

    try {
      // Get existing fieldValues
      const existingFieldValues = (contract.fieldValues as any) || {};

      // Update fieldValues with signature if provided
      const updatedFieldValues = {
        ...existingFieldValues,
        examiner: {
          ...(existingFieldValues.examiner || {}),
          ...(input.signatureImage && { signature: input.signatureImage }),
        },
      };

      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: "SIGNED" as ContractStatus,
          signedAt: new Date(),
          signedHtmlS3Key: htmlUpload.key,
          signedHtmlSha256: htmlUpload.sha256,
          ...(pdfUpload && {
            signedPdfS3Key: pdfUpload.key,
            signedPdfSha256: pdfUpload.sha256,
          }),
          fieldValues: updatedFieldValues,
        },
      });
    } catch (updateError: unknown) {
      const errorMessage =
        updateError instanceof Error ? updateError.message : "Unknown error";
      return {
        success: false,
        error: `Failed to update contract status: ${errorMessage}`,
      };
    }

    // Revalidate path
    try {
      revalidatePath(`/examiner/contract/${contract.id}`);
    } catch (revalidateError: unknown) {
      console.warn("Revalidation failed", revalidateError);
    }

    return { success: true, htmlFileKey: htmlUpload.key };
  } catch (error: unknown) {
    console.error("Error in signContractHandler:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign contract",
    };
  }
}
