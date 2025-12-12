"use server";

import { getLatestContractService } from "../services/getLatestContract.service";
import {
  createContractViewedEvent,
  markContractAsViewedService,
} from "../services/markContractAsViewed.service";

export async function markContractAsViewedHandler(
  contractId: string,
  accountId: string,
) {
  try {
    const contract = await getLatestContractService(contractId);
    if (!contract) return { success: false };

    if (contract.status === "SENT") {
      await markContractAsViewedService(contractId);
      await createContractViewedEvent(contractId, accountId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markContractAsViewedHandler:", error);
    return { success: false };
  }
}
