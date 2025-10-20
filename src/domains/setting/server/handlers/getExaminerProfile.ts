import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import prisma from "@/lib/db";

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

  // Get profile photo URL from Documents table if exists
  let profilePhotoUrl = null;
  if (profile.account.user.profilePhotoId) {
    const profilePhoto = await prisma.documents.findUnique({
      where: { id: profile.account.user.profilePhotoId },
    });
    if (profilePhoto) {
      // Construct CDN URL if available
      const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
      profilePhotoUrl = cdnUrl
        ? `${cdnUrl}/documents/examiner/${profile.account.userId}/${profilePhoto.name}`
        : null;
    }
  }

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
      profilePhotoId: profile.account.user.profilePhotoId || null,
      profilePhotoUrl: profilePhotoUrl,
      activationStep: profile.activationStep || null,
    },
  };
};

export default getExaminerProfile;
