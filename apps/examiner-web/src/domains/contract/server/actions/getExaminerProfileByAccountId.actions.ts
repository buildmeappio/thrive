"use server";

import { getExaminerProfileByAccountIdHandler } from "../handlers/getExaminerProfileByAccountId";

export const getExaminerProfileByAccountId = async (accountId: string) => {
  const result = await getExaminerProfileByAccountIdHandler(accountId);
  return result;
};
