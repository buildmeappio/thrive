"use server";

import { getExaminerProfileByAccountIdHandler } from "../handlers/getExaminerProfileByAccountId";

export const getExaminerProfileByAccountId = async (accountId: string) => {
  try {
    const result = await getExaminerProfileByAccountIdHandler(accountId);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get examiner profile",
    };
  }
};
