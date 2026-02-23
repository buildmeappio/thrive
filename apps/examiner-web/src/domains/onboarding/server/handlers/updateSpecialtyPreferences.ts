import { dashboardService } from "@/domains/setting/server/services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdateSpecialtyPreferencesInput = {
  examinerProfileId: string;
  specialty: string[];
  assessmentTypes: string[];
  preferredFormat: string;
  regionsServed: string[];
  languagesSpoken: string[];
  activationStep?: string;
};

const updateSpecialtyPreferences = async (
  payload: UpdateSpecialtyPreferencesInput,
) => {
  try {
    // Map preferredFormat to acceptVirtualAssessments boolean
    let acceptVirtualAssessments: boolean | undefined;
    if (payload.preferredFormat === "virtual") {
      acceptVirtualAssessments = true;
    } else if (payload.preferredFormat === "in_person") {
      acceptVirtualAssessments = false;
    } else if (payload.preferredFormat === "both") {
      acceptVirtualAssessments = true;
    }

    const updatedProfile = await dashboardService.updateSpecialtyPreferences(
      payload.examinerProfileId,
      {
        specialties: payload.specialty,
        assessmentTypes: payload.assessmentTypes,
        preferredRegions: payload.regionsServed.join(","),
        acceptVirtualAssessments,
        languagesSpoken: payload.languagesSpoken,
        activationStep: payload.activationStep,
      },
    );

    return {
      success: true,
      message: "Specialty preferences updated successfully",
      data: {
        id: updatedProfile.id,
      },
    };
  } catch (error) {
    console.error("Error updating specialty preferences:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
    );
  }
};

export default updateSpecialtyPreferences;
