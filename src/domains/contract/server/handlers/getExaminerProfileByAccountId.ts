"use server";

import { getExaminerProfileByAccountIdService } from "../services/getExaminerProfileByAccountId.service";

export async function getExaminerProfileByAccountIdHandler(accountId: string) {
  try {
    return await getExaminerProfileByAccountIdService(accountId);
  } catch (error) {
    console.error("Error in getExaminerProfileByAccountIdHandler:", error);
    return null;
  }
}
