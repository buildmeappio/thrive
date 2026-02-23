"use server";

import { getLatestContractService } from "../services/getLatestContract.service";

export async function getLatestContractHandler(contractId: string) {
  try {
    return await getLatestContractService(contractId);
  } catch (error) {
    console.error("Error in getLatestContractHandler:", error);
    return null;
  }
}
