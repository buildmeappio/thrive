"use server";

import { get } from "http";
import { getContractByExaminerProfileIdHandler } from "../handlers/getContractByExaminerProfileId";

export const getContractByExaminerProfileId = async (profileId: string) => {
  try {
    const result = await getContractByExaminerProfileIdHandler(profileId);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to get contract by examiner profile ID",
    };
  }
};
