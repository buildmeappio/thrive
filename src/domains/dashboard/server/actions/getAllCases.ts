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
  } catch (error: unknown) {
    console.error("Error in getAllCases action:", error);
    return {
      success: false,
      message: (error instanceof Error ? error.message : undefined) || "Failed to fetch cases",
    };
  }
};

export default getAllCasesAction;
