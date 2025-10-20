"use server";

import getExaminerProfileHandler from "../handlers/getExaminerProfile";

export const getExaminerProfileAction = async (accountId: string) => {
  try {
    return await getExaminerProfileHandler({ accountId });
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || "Failed to fetch examiner profile",
    };
  }
};
