import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type GetExaminerProfileInput = {
  accountId: string;
};

const getExaminerProfile = async (payload: GetExaminerProfileInput) => {
  const examinerProfile = await dashboardService.getExaminerProfileByAccountId(
    payload.accountId
  );

  if (!examinerProfile) {
    throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
  }

  // Type assertion for new fields that might not be in generated types yet
  const profile = examinerProfile as typeof examinerProfile & {
    activationStep?: string | null;
  };

  return {
    success: true,
    data: {
      id: profile.id,
      firstName: profile.account.user.firstName,
      lastName: profile.account.user.lastName,
      phoneNumber: profile.account.user.phone || "",
      emailAddress: profile.account.user.email,
      provinceOfResidence: profile.provinceOfResidence || "",
      mailingAddress: profile.mailingAddress || "",
      bio: profile.bio || "",
      profilePhoto: profile.account.user.profilePhotoId || null,
      activationStep: profile.activationStep || null,
    },
  };
};

export default getExaminerProfile;
