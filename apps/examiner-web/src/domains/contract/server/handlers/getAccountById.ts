"use server";

import { getAccountByIdService } from "../services/getAccountById.service";

export async function getAccountByIdHandler(accountId: string) {
  try {
    return await getAccountByIdService(accountId);
  } catch (error) {
    console.error("Error in getAccountByIdHandler:", error);
    return null;
  }
}
