"use server";

import getCaseDetailsHandler, {
  type GetCaseDetailsInput,
} from "../handlers/getCaseDetails";
import { GetCaseDetailsResponse } from "../../types";

export const getCaseDetailsAction = async (
  input: GetCaseDetailsInput
): Promise<GetCaseDetailsResponse> => {
  try {
    const result = await getCaseDetailsHandler(input);
    return result;
  } catch (error: unknown) {
    console.error("Error in getCaseDetails action:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch case details",
    };
  }
};

export default getCaseDetailsAction;
