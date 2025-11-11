"use server";

import { getAccountByIdHandler } from "../handlers/getAccountById";

export const getAccountById = async (accountId: string) => {
  try {
    const result = await getAccountByIdHandler(accountId);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get account by ID",
    };
  }
};
