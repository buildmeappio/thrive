import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type UpdateExaminerProfileInput = {
  examinerProfileId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  provinceOfResidence: string;
  mailingAddress: string;
  bio?: string;
  activationStep?: string;
};

const updateExaminerProfile = async (payload: UpdateExaminerProfileInput) => {
  try {
    const updatedProfile = await dashboardService.updateExaminerProfileInfo(
      payload.examinerProfileId,
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        emailAddress: payload.emailAddress,
        provinceOfResidence: payload.provinceOfResidence,
        mailingAddress: payload.mailingAddress,
        bio: payload.bio,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedProfile.id,
        firstName: updatedProfile.account.user.firstName,
        lastName: updatedProfile.account.user.lastName,
        phoneNumber: updatedProfile.account.user.phone || "",
        emailAddress: updatedProfile.account.user.email,
        provinceOfResidence: updatedProfile.provinceOfResidence || "",
        mailingAddress: updatedProfile.mailingAddress || "",
        bio: updatedProfile.bio || "",
      },
    };
  } catch (error) {
    console.error("Error updating examiner profile:", error);
    throw HttpError.internalServerError(
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE
    );
  }
};

export default updateExaminerProfile;
