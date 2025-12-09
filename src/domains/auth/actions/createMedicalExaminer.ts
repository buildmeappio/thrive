"use server";

import { CreateMedicalExaminerInput } from "../server/handlers/createMedicalExaminer";
import authHandlers from "../server/handlers/index";

const createMedicalExaminer = async (payload: CreateMedicalExaminerInput) => {
  try {
    const result = await authHandlers.createMedicalExaminer(payload);
    return result;
  } catch (error: unknown) {
    console.error("Error in createMedicalExaminer action:", error);
    return {
      success: false,
      message:
        error?.message ||
        "Failed to create medical examiner profile. Please try again.",
    };
  }
};

export default createMedicalExaminer;
