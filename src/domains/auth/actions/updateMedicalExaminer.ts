"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";
import { UpdateMedicalExaminerInput } from "../server/handlers/updateMedicalExaminer";

const updateMedicalExaminer = async (payload: UpdateMedicalExaminerInput) => {
  try {
    const result = await authHandlers.updateMedicalExaminer(payload);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE);
  }
};

export default updateMedicalExaminer;
