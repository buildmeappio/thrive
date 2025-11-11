"use server";

import { signContractHandler } from "../handlers/signContract";

export const signContract = async (
  contractId: string,
  signerName: string,
  htmlContent: string,
  pdfBase64: string,
  ipAddress?: string,
  userAgent?: string
) => {
  try {
    const result = await signContractHandler({
      contractId,
      signerName,
      htmlContent,
      pdfBase64,
      ipAddress,
      userAgent,
    });
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to sign contract",
    };
  }
};
