import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import { MedicalLicenseDocument } from "@/types/components";
import { SecureLinkStatus } from "@thrive/database";

export type VerifyResumeTokenInput = {
  token: string;
};

const verifyResumeTokenHandler = async (payload: VerifyResumeTokenInput) => {
  try {
    if (!payload.token) {
      throw HttpError.badRequest("Token is required");
    }

    // Look up the token in the database
    const secureLink = await prisma.secureLink.findFirst({
      where: {
        token: payload.token,
      },
      include: {
        applicationSecureLink: {
          include: {
            application: {
              include: {
                address: true,
              },
            },
          },
        },
      },
    });

    if (!secureLink) {
      throw HttpError.unauthorized("Invalid resume token");
    }

    // Check if the link has expired (based on expiresAt date)
    const now = new Date();
    if (secureLink.expiresAt < now) {
      // Update status to EXPIRED if not already
      if (secureLink.status === SecureLinkStatus.PENDING) {
        await prisma.secureLink.update({
          where: { id: secureLink.id },
          data: { status: SecureLinkStatus.EXPIRED },
        });
      }
      throw HttpError.unauthorized("This resume link has expired (7 days)");
    }

    // Check if the link status is valid (PENDING)
    if (secureLink.status === SecureLinkStatus.INVALID) {
      throw HttpError.unauthorized(
        "This resume link is no longer valid. A newer link has been generated.",
      );
    }

    if (secureLink.status === SecureLinkStatus.EXPIRED) {
      throw HttpError.unauthorized("This resume link has expired");
    }

    if (secureLink.status === SecureLinkStatus.SUBMITTED) {
      throw HttpError.badRequest("This application has already been submitted");
    }

    // Get the application from the secure link
    const applicationSecureLink = secureLink.applicationSecureLink[0];
    if (!applicationSecureLink) {
      throw HttpError.notFound("Application not found for this token");
    }

    const application = applicationSecureLink.application;

    // Fetch medical license documents by IDs
    let medicalLicenseDocuments: MedicalLicenseDocument[] = [];
    if (
      application?.medicalLicenseDocumentIds &&
      application.medicalLicenseDocumentIds.length > 0
    ) {
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

    // Check if application is still in DRAFT status (can be resumed)
    // Allow DRAFT and SUBMITTED statuses to be resumed
    if (application.status !== "DRAFT" && application.status !== "SUBMITTED") {
      throw HttpError.badRequest("This application can no longer be resumed");
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
    throw HttpError.fromError(error, ErrorMessages.REGISTRATION_FAILED, 500);
  }
};

export default verifyResumeTokenHandler;
