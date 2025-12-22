import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { ExaminerStatus, SecureLinkStatus } from "@prisma/client";
import { emailService } from "@/server";
import ErrorMessages from "@/constants/ErrorMessages";
import { capitalizeFirstLetter } from "@/utils/text";

export type CreateMedicalExaminerInput = {
  // step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  landlineNumber: string;

  // step 2 - Address
  address: string;
  street?: string;
  suite?: string;
  postalCode?: string;
  province?: string;
  city?: string;

  // step 2 - Medical Credentials
  specialties: string[];
  licenseNumber: string;
  licenseIssuingProvince: string;
  yearsOfIMEExperience: string;
  licenseExpiryDate?: Date; // Optional
  medicalLicenseDocumentIds: string[]; // Support multiple documents
  resumeDocumentId?: string; // Optional - CV/Resume will be added later

  // step 1 - Languages
  languagesSpoken: string[];

  // step 3 - IME Background & Experience
  imesCompleted: string;
  currentlyConductingIMEs: boolean;
  assessmentTypes: string[];
  redactedIMEReportDocumentId?: string;

  // Legacy field
  forensicAssessmentTrained?: boolean; // Optional - removed from Step 3

  // step 4
  experienceDetails?: string;

  // step 7
  // signedNDADocumentId: string;
  // insuranceProofDocumentId: string;
  agreeTermsConditions: boolean;
  consentBackgroundVerification: boolean;

  // step 6 - Payment Details
  // IMEFee: string;
  // recordReviewFee: string;
  // hourlyRate?: string;
  // cancellationFee: string;
};

const createMedicalExaminer = async (payload: CreateMedicalExaminerInput) => {
  try {
    // Check if application already exists for this email
    const existingApplication = await prisma.examinerApplication.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (existingApplication) {
      throw HttpError.badRequest(
        "An application with this email already exists",
      );
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        address: payload.address || "",
        street: payload.street || null,
        suite: payload.suite || null,
        postalCode: payload.postalCode || null,
        province: payload.province || null,
        city: payload.city || null,
      },
    });

    // Create examiner application (NO user, NO account, NO examiner profile)
    const examinerApplication = await prisma.examinerApplication.create({
      data: {
        // Personal Information - capitalize first letter
        firstName: capitalizeFirstLetter(payload.firstName),
        lastName: capitalizeFirstLetter(payload.lastName),
        email: payload.email,
        phone: payload.phone || null,
        landlineNumber: payload.landlineNumber || null,
        provinceOfResidence: payload.province || "",
        mailingAddress: payload.address || "",
        address: {
          connect: { id: address.id },
        },

        // Medical Credentials
        specialties: payload.specialties,
        licenseNumber: payload.licenseNumber,
        provinceOfLicensure: payload.licenseIssuingProvince || null,
        ...(payload.licenseExpiryDate && {
          licenseExpiryDate: payload.licenseExpiryDate,
        }),
        medicalLicenseDocumentIds: payload.medicalLicenseDocumentIds,
        ...(payload.resumeDocumentId && {
          resumeDocument: {
            connect: { id: payload.resumeDocumentId },
          },
        }),

        // IME Background
        isForensicAssessmentTrained: payload.forensicAssessmentTrained ?? false,
        yearsOfIMEExperience: payload.yearsOfIMEExperience,
        imesCompleted: payload.imesCompleted || null,
        currentlyConductingIMEs: payload.currentlyConductingIMEs || null,
        assessmentTypeIds: payload.assessmentTypes, // Array of assessment type IDs
        ...(payload.redactedIMEReportDocumentId && {
          redactedIMEReportDocument: {
            connect: { id: payload.redactedIMEReportDocumentId },
          },
        }),
        experienceDetails: payload.experienceDetails || null,

        // Languages (stored as array of language IDs)
        languagesSpoken: payload.languagesSpoken || [],

        // Consent
        isConsentToBackgroundVerification:
          payload.consentBackgroundVerification,
        agreeToTerms: payload.agreeTermsConditions,

        // Application Status
        status: ExaminerStatus.SUBMITTED,
      },
    });

    // Mark all secure links for this application as SUBMITTED
    const applicationSecureLinks = await prisma.applicationSecureLink.findMany({
      where: {
        applicationId: examinerApplication.id,
      },
    });

    if (applicationSecureLinks.length > 0) {
      const secureLinkIds = applicationSecureLinks.map(
        (link) => link.secureLinkId,
      );
      await prisma.secureLink.updateMany({
        where: {
          id: { in: secureLinkIds },
        },
        data: {
          status: SecureLinkStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });
    }

    // Send confirmation email
    await emailService.sendEmail(
      "Your Thrive Medical Examiner Application Has Been Received",
      "application-received.html",
      {
        firstName: capitalizeFirstLetter(payload.firstName),
        lastName: capitalizeFirstLetter(payload.lastName),
      },
      payload.email,
    );

    return {
      success: true,
      message: "Medical examiner application submitted successfully",
      applicationId: examinerApplication.id,
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.REGISTRATION_FAILED, 500);
  }
};

export default createMedicalExaminer;
