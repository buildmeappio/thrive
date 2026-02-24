import { dashboardService } from '../services/dashboard.service';
import HttpError from '@/utils/httpError';
import ErrorMessages from '@/constants/ErrorMessages';

export type UpdateExaminerProfileInput = {
  examinerProfileId: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  landlineNumber?: string;
  provinceOfResidence?: string;
  mailingAddress?: string;
  professionalTitle?: string;
  yearsOfExperience?: string;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;
  profilePhoto?: File;
  profilePhotoId?: string | null;
  activationStep?: string;
};

const updateExaminerProfile = async (payload: UpdateExaminerProfileInput) => {
  try {
    const updatedProfile = await dashboardService.updateExaminerProfileInfo(
      payload.examinerProfileId,
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        emailAddress: payload.emailAddress,
        phoneNumber: payload.phoneNumber,
        landlineNumber: payload.landlineNumber,
        provinceOfResidence: payload.provinceOfResidence,
        mailingAddress: payload.mailingAddress,
        professionalTitle: payload.professionalTitle,
        yearsOfExperience: payload.yearsOfExperience,
        clinicName: payload.clinicName,
        clinicAddress: payload.clinicAddress,
        bio: payload.bio,
        profilePhotoId: payload.profilePhotoId,
        activationStep: payload.activationStep,
      }
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedProfile.id,
        firstName: updatedProfile.account.user.firstName,
        lastName: updatedProfile.account.user.lastName,
        emailAddress: updatedProfile.account.user.email,
        professionalTitle: updatedProfile.professionalTitle || '',
        yearsOfExperience: updatedProfile.yearsOfIMEExperience || '',
        clinicName: updatedProfile.clinicName || '',
        clinicAddress: updatedProfile.clinicAddress || '',
        bio: updatedProfile.bio || '',
        profilePhotoId: updatedProfile.account.user.profilePhotoId || null,
      },
    };
  } catch (error) {
    console.error('Error updating examiner profile:', error);
    throw HttpError.internalServerError(ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE);
  }
};

export default updateExaminerProfile;
