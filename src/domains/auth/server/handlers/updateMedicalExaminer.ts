import HttpError from "@/utils/httpError";
import { examinerService } from "../services";
import ErrorMessages from "@/constants/ErrorMessages";
import emailService from "@/services/email.service";

export type UpdateMedicalExaminerInput = {
  examinerProfileId: string;

  // step 1
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  provinceOfResidence?: string;
  mailingAddress?: string;

  // step 2
  specialties?: string[];
  licenseNumber?: string;
  provinceOfLicensure?: string;
  licenseExpiryDate?: Date;
  medicalLicenseDocumentId?: string;
  resumeDocumentId?: string;

  // step 3
  yearsOfIMEExperience?: string;
  languagesSpoken?: string[];
  forensicAssessmentTrained?: boolean;

  // step 4
  experienceDetails?: string;

  // step 5
  preferredRegions?: string;
  maxTravelDistance?: string;
  acceptVirtualAssessments?: boolean;

  // step 6
  signedNDADocumentId?: string;
  insuranceProofDocumentId?: string;
  agreeTermsConditions?: boolean;
  consentBackgroundVerification?: boolean;
};

const updateMedicalExaminer = async (payload: UpdateMedicalExaminerInput) => {
  try {
    // Update examiner profile
    const updatedProfile = await examinerService.updateExaminerProfile(
      payload.examinerProfileId,
      payload
    );

    // Get examiner details for email
    const examinerDetails = await examinerService.getExaminerProfileWithDetails(
      payload.examinerProfileId
    );

    // Send update confirmation email
    await emailService.sendEmail(
      "Your Profile Has Been Updated Successfully",
      "application-received.html", // Reuse template or create new one
      {
        firstName: examinerDetails.account.user.firstName,
        lastName: examinerDetails.account.user.lastName,
      },
      examinerDetails.account.user.email
    );

    return {
      success: true,
      message: "Medical examiner profile updated successfully",
      data: {
        examinerProfileId: updatedProfile.id,
        status: updatedProfile.status,
      },
    };
  } catch (error) {
    throw HttpError.fromError(
      error,
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
      500
    );
  }
};

export default updateMedicalExaminer;
