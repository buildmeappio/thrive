import { dashboardService } from "../services/dashboard.service";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import prisma from "@/lib/db";

export type GetExaminerProfileInput = {
  accountId: string;
};

const getExaminerProfile = async (payload: GetExaminerProfileInput) => {
  const examinerProfile = await dashboardService.getExaminerProfileByAccountId(
    payload.accountId,
  );

  if (!examinerProfile) {
    throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
  }

  // Type assertion for new fields that might not be in generated types yet
  const profile = examinerProfile as typeof examinerProfile & {
    activationStep?: string | null;
    professionalTitle?: string | null;
    clinicName?: string | null;
    clinicAddress?: string | null;
    emailPaymentPayout?: boolean | null;
    smsNotifications?: boolean | null;
    emailMarketing?: boolean | null;
    phipaCompliance?: boolean | null;
    pipedaCompliance?: boolean | null;
    medicalLicenseActive?: boolean | null;
    medicalLicenseDocumentIds?: string[];
    governmentIdDocumentId?: string | null;
    resumeDocumentId?: string | null;
    insuranceDocumentId?: string | null;
    specialtyCertificatesDocumentIds?: string[];
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
      emailAddress: profile.account.user.email,
      phoneNumber: profile.account.user.phone || "",
      landlineNumber: profile.landlineNumber || "",
      provinceOfResidence: profile.provinceOfResidence || "",
      mailingAddress: profile.mailingAddress || "",
      professionalTitle: profile.professionalTitle || "",
      yearsOfExperience: profile.yearsOfIMEExperience || "",
      clinicName: profile.clinicName || "",
      clinicAddress: profile.clinicAddress || "",
      bio: profile.bio || "",
      profilePhotoId: profile.account.user.profilePhotoId || null,
      profilePhotoUrl: profilePhotoUrl,
      activationStep: profile.activationStep || null,
      assessmentTypes: profile.assessmentTypes || [],
      acceptVirtualAssessments: profile.acceptVirtualAssessments ?? true,
      maxTravelDistance: profile.maxTravelDistance || null,
      assessmentTypeOther: profile.assessmentTypeOther || null,
      // Notification settings - return null if not set, so form can use defaults
      emailPaymentPayout: profile.emailPaymentPayout ?? null,
      smsNotifications: profile.smsNotifications ?? null,
      emailMarketing: profile.emailMarketing ?? null,
      // Compliance fields - return boolean value or null if not set
      phipaCompliance:
        typeof profile.phipaCompliance === "boolean"
          ? profile.phipaCompliance
          : null,
      pipedaCompliance:
        typeof profile.pipedaCompliance === "boolean"
          ? profile.pipedaCompliance
          : null,
      medicalLicenseActive:
        typeof profile.medicalLicenseActive === "boolean"
          ? profile.medicalLicenseActive
          : null,
      // Document IDs - these are copied from application during account creation
      medicalLicenseDocumentIds: profile.medicalLicenseDocumentIds || [],
      governmentIdDocumentId: profile.governmentIdDocumentId || null,
      resumeDocumentId: profile.resumeDocumentId || null,
      insuranceDocumentId: profile.insuranceDocumentId || null,
      specialtyCertificatesDocumentIds:
        profile.specialtyCertificatesDocumentIds || [],
    },
  };
};

export default getExaminerProfile;
