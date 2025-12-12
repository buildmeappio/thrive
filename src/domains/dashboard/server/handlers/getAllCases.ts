import { casesService } from "../services/cases.service";
import HttpError from "@/utils/httpError";
import { GetAllCasesInput, GetAllCasesResponse } from "../../types";

const getAllCases = async (
  payload: GetAllCasesInput,
): Promise<GetAllCasesResponse> => {
  try {
    const { examinerProfileId } = payload;

    if (!examinerProfileId) {
      throw HttpError.badRequest("Examiner Profile ID is required");
    }

    const result = await casesService.getAllCases(examinerProfileId);

    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error("Error in getAllCases handler:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to fetch cases",
    };
  }
};

export default getAllCases;
export type { GetAllCasesInput };
