"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";
import { UpdateMedicalExaminerInput } from "../server/handlers/updateMedicalExaminer";

const updateMedicalExaminer = async (payload: UpdateMedicalExaminerInput) => {
  try {
    const result = await authHandlers.updateMedicalExaminer(payload);
    return result;
  } catch (error: unknown) {
    console.error("Error in updateMedicalExaminer action:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
    };
  }
};

export default updateMedicalExaminer;
