"use server";

import { revalidatePath } from "next/cache";
import { getLatestContractService } from "../services/getLatestContract.service";
import {
  uploadHtmlToS3,
  updateContractStatus,
} from "../services/signContract.service";

export interface SignContractInput {
  contractId: string;
  signerName: string;
  htmlContent: string;
  pdfBase64: string;
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

    let htmlUpload: { key: string; sha256: string };
    try {
      htmlUpload = await uploadHtmlToS3(input.contractId, input.htmlContent);
    } catch (s3Error: any) {
      return {
        success: false,
        error: `Failed to upload HTML: ${s3Error.message}`,
      };
    }

    try {
      await updateContractStatus(contract.id, "SIGNED", {
        signedPdfBuffer: pdfBuffer,
        signedHtmlKey: htmlUpload.key,
        signedHtmlSha256: htmlUpload.sha256,
      });
    } catch (updateError: any) {
      return {
        success: false,
        error: `Failed to update contract status: ${updateError.message}`,
      };
    }

    // Revalidate path
    try {
      revalidatePath(`/examiner/contract/${contract.id}`);
    } catch (revalidateError: any) {
      console.warn("Revalidation failed", revalidateError);
    }

    return { success: true, htmlFileKey: htmlUpload.key };
  } catch (error: any) {
    console.error("Error in signContractHandler:", error);
    return {
      success: false,
      error: error.message || "Failed to sign contract",
    };
  }
}
