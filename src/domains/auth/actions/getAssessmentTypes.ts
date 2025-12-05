"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

const getAssessmentTypes = async () => {
  try {
    const assessmentTypes = await authHandlers.getAssessmentTypes();
    return assessmentTypes;
  } catch (error) {
    console.error(error);
    throw new Error(
      ErrorMessages.ASSESSMENT_TYPES_NOT_FOUND || "Failed to fetch assessment types"
    );
  }
};

export default getAssessmentTypes;

