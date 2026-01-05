"use server";

import { listContracts as listContractsService } from "../server/contract.service";
import type { ListContractsInput } from "../types/contract.types";

export async function listContractsAction(input: ListContractsInput) {
  try {
    const contracts = await listContractsService(input);
    return contracts;
  } catch (error) {
    console.error("Error listing contracts:", error);
    return [];
  }
}
