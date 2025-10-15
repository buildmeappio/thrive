"use server";

import { verifyExaminerResubmitToken } from "@/lib/jwt";
import examinerService from "../server/examiner.service";

/**
 * Fetch examiner data using a resubmission token
 * This is used when an examiner clicks on the "Request More Info" link to resubmit their application
 */
export async function getExaminerByToken(token: string) {
  try {
    // Verify and decode the token
    const decoded = verifyExaminerResubmitToken(token);

    if (!decoded.examinerId) {
      throw new Error("Invalid token: missing examiner ID");
    }

    // Fetch the examiner data
    const examiner = await examinerService.getExaminerById(decoded.examinerId);

    if (!examiner) {
      throw new Error("Examiner not found");
    }

    // Return the examiner data for pre-filling the form
    return {
      success: true,
      data: {
        examinerId: examiner.id,
        accountId: examiner.accountId,
        userId: decoded.userId,
        email: decoded.email,
        // Personal details
        firstName: examiner.account?.user?.firstName || "",
        lastName: examiner.account?.user?.lastName || "",
        phone: examiner.account?.user?.phone || "",
        provinceOfResidence: examiner.provinceOfResidence || "",
        mailingAddress: examiner.mailingAddress || "",
        // Medical credentials
        specialties: examiner.specialties || [],
        licenseNumber: examiner.licenseNumber || "",
        provinceOfLicensure: examiner.provinceOfLicensure || "",
        licenseExpiryDate: examiner.licenseExpiryDate || null,
        medicalLicenseDocumentId: examiner.medicalLicenseDocumentId || "",
        resumeDocumentId: examiner.resumeDocumentId || "",
        // IME Experience
        yearsOfIMEExperience: examiner.yearsOfIMEExperience || "",
        isForensicAssessmentTrained: examiner.isForensicAssessmentTrained || false,
        languageIds: examiner.examinerLanguages?.map((el) => el.languageId) || [],
        // Past experience
        bio: examiner.bio || "",
        // Legal & compliance
        isConsentToBackgroundVerification: examiner.isConsentToBackgroundVerification || false,
        agreeToTerms: examiner.agreeToTerms || false,
        ndaDocumentId: examiner.NdaDocumentId || null,
        insuranceDocumentId: examiner.insuranceDocumentId || null,
      },
    };
  } catch (error) {
    console.error("Error fetching examiner by token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch examiner data",
    };
  }
}

export default getExaminerByToken;

