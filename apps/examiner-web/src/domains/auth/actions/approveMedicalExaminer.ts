"use server";

import { ApproveMedicalExaminerInput } from "../server/handlers/approveMedicalExaminer";
import authHandlers from "../server/handlers/index";

const approveMedicalExaminer = async (payload: ApproveMedicalExaminerInput) => {
  const result = await authHandlers.approveMedicalExaminer(payload);
  return result;
};

export default approveMedicalExaminer;
