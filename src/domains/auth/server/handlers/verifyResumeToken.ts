import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { verifyResumeToken } from "@/lib/jwt";
import ErrorMessages from "@/constants/ErrorMessages";

export type VerifyResumeTokenInput = {
  token: string;
};

const verifyResumeTokenHandler = async (
  payload: VerifyResumeTokenInput
) => {
  try {
    if (!payload.token) {
      throw HttpError.badRequest("Token is required");
    }

    // Verify token
    const decoded = verifyResumeToken(payload.token);
    if (!decoded) {
      throw HttpError.unauthorized("Invalid or expired resume token");
    }

    const { email, applicationId } = decoded as {
      email: string;
      applicationId: string;
    };

    if (!email || !applicationId) {
      throw HttpError.unauthorized("Invalid token payload");
    }

    // Fetch application with all related data
    const application = await prisma.examinerApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        address: true,
      },
    });

    // Fetch medical license documents by IDs
    let medicalLicenseDocuments: any[] = [];
    if (application?.medicalLicenseDocumentIds && application.medicalLicenseDocumentIds.length > 0) {
      medicalLicenseDocuments = await prisma.documents.findMany({
        where: {
          id: {
            in: application.medicalLicenseDocumentIds,
          },
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          type: true,
          size: true,
        },
      });
    }

    if (!application) {
      throw HttpError.notFound("Application not found");
    }

    // Verify email matches
    if (application.email !== email) {
      throw HttpError.forbidden("Token email does not match application");
    }

    // Check if application is still in DRAFT status (can be resumed)
    // Allow DRAFT and SUBMITTED statuses to be resumed
    if (
      application.status !== "DRAFT" &&
      application.status !== "SUBMITTED"
    ) {
      throw HttpError.badRequest(
        "This application can no longer be resumed"
      );
    }

    return {
      success: true,
      application: {
        id: application.id,
        email: application.email,
        firstName: application.firstName,
        lastName: application.lastName,
        phone: application.phone,
        landlineNumber: application.landlineNumber,
        province: application.provinceOfResidence,
        city: application.address?.city || "",
        address: application.mailingAddress,
        street: application.address?.street || "",
        suite: application.address?.suite || "",
        postalCode: application.address?.postalCode || "",
        languagesSpoken: application.languagesSpoken || [],
        medicalSpecialty: application.specialties || [],
        licenseNumber: application.licenseNumber,
        licenseIssuingProvince: application.provinceOfLicensure || "",
        yearsOfIMEExperience: application.yearsOfIMEExperience,
        licenseExpiryDate: application.licenseExpiryDate,
        medicalLicenseDocuments: medicalLicenseDocuments || [],
        imesCompleted: application.imesCompleted || "",
        currentlyConductingIMEs: application.currentlyConductingIMEs,
        assessmentTypes: application.assessmentTypeIds || [],
        redactedIMEReportDocument: null,
        experienceDetails: application.experienceDetails || "",
        consentBackgroundVerification:
          application.isConsentToBackgroundVerification,
        agreeTermsConditions: application.agreeToTerms,
        status: application.status,
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw HttpError.fromError(
      error,
      ErrorMessages.REGISTRATION_FAILED,
      500
    );
  }
};

export default verifyResumeTokenHandler;

