"use server";

import { getLatestContract } from "./getLatestContract.actions";

export const getContractHtmlAction = async (
  contractId: string,
): Promise<{
  success: boolean;
  contractHtml?: string | null;
  error?: string;
}> => {
  try {
    if (!contractId) {
      return {
        success: false,
        error: "Contract ID is required",
      };
    }

    const contract = await getLatestContract(contractId);

    if (!contract) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    return {
      success: true,
      contractHtml: contract.contractHtml || null,
    };
  } catch (error: unknown) {
    console.error("Error in getContractHtmlAction:", error);
    return {
      success: false,
      error:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to fetch contract HTML",
    };
  }
};

