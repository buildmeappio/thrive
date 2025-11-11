"use server";

import { markContractAsViewedHandler } from "../handlers/markContractAsViewed";

export const markContractAsViewed = async (
  contractId: string,
  accountId: string
) => {
  try {
    const result = await markContractAsViewedHandler(contractId, accountId);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to mark contract as viewed",
    };
  }
};
