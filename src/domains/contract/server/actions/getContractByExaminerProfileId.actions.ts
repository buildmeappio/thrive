"use server";

import { get } from "http";
import { getContractByExaminerProfileIdHandler } from "../handlers/getContractByExaminerProfileId";

export const getContractByExaminerProfileId = async (profileId: string) => {
  const result = await getContractByExaminerProfileIdHandler(profileId);
  return result;
};
