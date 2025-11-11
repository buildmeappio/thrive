"use server";

import { getAccountByIdHandler } from "../handlers/getAccountById";

export const getAccountById = async (accountId: string) => {
  const result = await getAccountByIdHandler(accountId);
  return result;
};
