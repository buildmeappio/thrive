import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type GetSpecialtyPreferencesInput = {
  accountId: string;
};

const getSpecialtyPreferences = async (
  payload: GetSpecialtyPreferencesInput
) => {
  const examinerProfile = await dashboardService.getExaminerProfileByAccountId(
    payload.accountId
  );

  if (!examinerProfile) {
    throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
  }

  // Get language IDs from examinerLanguages
  const languageIds = examinerProfile.examinerLanguages.map(
    (el) => el.languageId
  );

  // Type assertion for new fields that might not be in generated types yet
  const profile = examinerProfile as typeof examinerProfile & {
    assessmentTypes?: string[];
    activationStep?: string | null;
  };

  return {
    success: true,
    data: {
      id: profile.id,
      specialty: profile.specialties || [],
      assessmentTypes: profile.assessmentTypes || [],
      preferredFormat: profile.acceptVirtualAssessments ? "both" : "in_person", // Map from boolean
      regionsServed: profile.preferredRegions
        ? profile.preferredRegions.split(",")
        : [],
      languagesSpoken: languageIds,
      activationStep: profile.activationStep || null,
    },
  };
};

export default getSpecialtyPreferences;
