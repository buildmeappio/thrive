"use server";

import { signContractHandler } from "../handlers/signContract";

export const signContract = async (
  contractId: string,
  signerName: string,
  htmlContent: string,
  pdfBase64: string,
  signatureImage?: string,
  ipAddress?: string,
  userAgent?: string,
) => {
  const result = await signContractHandler({
    contractId,
    signerName,
    htmlContent,
    pdfBase64,
    signatureImage,
    ipAddress,
    userAgent,
  });
  return result;
};
