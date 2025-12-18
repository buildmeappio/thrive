"use server";

import { verifyExaminerResubmitToken } from "@/lib/jwt";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import logger from "@/utils/logger";

type UpdateExaminerData = {
  // Personal details
  firstName?: string;
  lastName?: string;
  phone?: string;
  provinceOfResidence?: string;
  mailingAddress?: string;
  // Medical credentials
  specialties?: string[];
  licenseNumber?: string;
  provinceOfLicensure?: string;
  licenseExpiryDate?: Date | null;
  medicalLicenseDocumentId?: string;
  resumeDocumentId?: string;
  // IME Experience
  yearsOfIMEExperience?: string;
  isForensicAssessmentTrained?: boolean;
  languageIds?: string[];
  // Past experience
  bio?: string;
  // Legal & compliance
  isConsentToBackgroundVerification?: boolean;
  agreeToTerms?: boolean;
  ndaDocumentId?: string | null;
  insuranceDocumentId?: string | null;
};

/**
 * Update examiner profile after resubmission via "Request More Info" flow
 * @param token - The resubmission token
 * @param data - The updated examiner data
 */
export async function updateExaminerProfile(
  token: string,
  data: UpdateExaminerData,
) {
  try {
    // Verify and decode the token
    const decoded = verifyExaminerResubmitToken(token);

    if (!decoded.examinerId || !decoded.userId || !decoded.accountId) {
      throw new Error("Invalid token: missing required fields");
    }

    // Start a transaction to update both user and examiner profile
    const result = await prisma.$transaction(async (tx) => {
      // Update user information if provided
      if (data.firstName || data.lastName || data.phone) {
        await tx.user.update({
          where: { id: decoded.userId },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone && { phone: data.phone }),
          },
        });
      }

      // Update examiner profile
      const examinerProfile = await tx.examinerProfile.update({
        where: { id: decoded.examinerId },
        data: {
          ...(data.provinceOfResidence && {
            provinceOfResidence: data.provinceOfResidence,
          }),
          ...(data.mailingAddress && { mailingAddress: data.mailingAddress }),
          ...(data.specialties && { specialties: data.specialties }),
          ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
          ...(data.provinceOfLicensure && {
            provinceOfLicensure: data.provinceOfLicensure,
          }),
          ...(data.licenseExpiryDate !== undefined && {
            licenseExpiryDate: data.licenseExpiryDate,
          }),
          ...(data.medicalLicenseDocumentId && {
            medicalLicenseDocumentId: data.medicalLicenseDocumentId,
          }),
          ...(data.resumeDocumentId && {
            resumeDocumentId: data.resumeDocumentId,
          }),
          ...(data.yearsOfIMEExperience && {
            yearsOfIMEExperience: data.yearsOfIMEExperience,
          }),
          ...(data.isForensicAssessmentTrained !== undefined && {
            isForensicAssessmentTrained: data.isForensicAssessmentTrained,
          }),
          ...(data.bio && { bio: data.bio }),
          ...(data.isConsentToBackgroundVerification !== undefined && {
            isConsentToBackgroundVerification:
              data.isConsentToBackgroundVerification,
          }),
          ...(data.agreeToTerms !== undefined && {
            agreeToTerms: data.agreeToTerms,
          }),
          ...(data.ndaDocumentId !== undefined && {
            NdaDocumentId: data.ndaDocumentId,
          }),
          ...(data.insuranceDocumentId !== undefined && {
            insuranceDocumentId: data.insuranceDocumentId,
          }),
          // Reset status back to PENDING for admin review
          status: "PENDING",
          // updatedAt is automatically updated by Prisma
        },
      });

      // Update languages if provided
      if (data.languageIds && data.languageIds.length > 0) {
        // Delete existing language associations
        await tx.examinerLanguage.deleteMany({
          where: { examinerProfileId: decoded.examinerId },
        });

        // Create new language associations
        await tx.examinerLanguage.createMany({
          data: data.languageIds.map((languageId) => ({
            examinerProfileId: decoded.examinerId,
            languageId: languageId,
          })),
        });
      }

      return examinerProfile;
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard");
    revalidatePath("/examiner");
    revalidatePath(`/examiner/${decoded.examinerId}`);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    logger.error("Error updating examiner profile:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update examiner profile",
    };
  }
}

export default updateExaminerProfile;
