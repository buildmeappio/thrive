"use server";

import updateServicesAssessmentHandler from "../handlers/updateServicesAssessment";

export const updateServicesAssessmentAction = async (data: {
  examinerProfileId: string;
  assessmentTypes: string[];
  acceptVirtualAssessments: boolean;
  acceptInPersonAssessments: boolean;
  travelToClaimants: boolean;
  travelRadius?: string;
  assessmentTypeOther?: string;
  activationStep?: string;
}) => {
  try {
    return await updateServicesAssessmentHandler(data);
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to update services assessment",
    };
  }
};
