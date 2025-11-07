"use server";

import getAllCasesHandler, {
  type GetAllCasesInput,
} from "../handlers/getAllCases";
import { GetAllCasesResponse } from "../../types";

export const getAllCasesAction = async (
  input: GetAllCasesInput
): Promise<GetAllCasesResponse> => {
  try {
    const result = await getAllCasesHandler(input);
    return result;
  } catch (error: any) {
    console.error("Error in getAllCases action:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch cases",
    };
  }
};

export default getAllCasesAction;
