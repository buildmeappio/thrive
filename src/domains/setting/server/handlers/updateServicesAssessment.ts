import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdateServicesAssessmentInput = {
  examinerProfileId: string;
  assessmentTypes: string[];
  acceptVirtualAssessments: boolean;
  acceptInPersonAssessments: boolean;
  travelToClaimants: boolean;
  travelRadius?: string;
  assessmentTypeOther?: string;
  activationStep?: string;
};

const updateServicesAssessment = async (
  payload: UpdateServicesAssessmentInput
) => {
  try {
    const updatedProfile = await dashboardService.updateServicesAssessment(
      payload.examinerProfileId,
      {
        assessmentTypes: payload.assessmentTypes,
        acceptVirtualAssessments: payload.acceptVirtualAssessments,
        acceptInPersonAssessments: payload.acceptInPersonAssessments,
        travelToClaimants: payload.travelToClaimants,
        travelRadius: payload.travelRadius,
        assessmentTypeOther: payload.assessmentTypeOther,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: "Services & Assessment Types updated successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error updating services assessment:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE
    );
  }
};

export default updateServicesAssessment;

