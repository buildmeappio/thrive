import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { ExaminerStatus, SecureLinkStatus } from "@prisma/client";
import { uploadFileToS3 } from "@/lib/s3";
import ErrorMessages from "@/constants/ErrorMessages";
import { randomBytes } from "crypto";

export type SaveApplicationProgressInput = {
  // step 1
  firstName?: string;
  lastName?: string;
  email: string; // Required - we need email to identify the application
  phone?: string;
  landlineNumber?: string;

  // step 2 - Address
  address?: string;
  street?: string;
  suite?: string;
  postalCode?: string;
  province?: string;
  city?: string;

  // step 2 - Medical Credentials
  specialties?: string[];
  licenseNumber?: string;
  licenseIssuingProvince?: string;
  yearsOfIMEExperience?: string;
  licenseExpiryDate?: Date;
  medicalLicense?: File | File[]; // Files to upload
  existingMedicalLicenseDocumentIds?: string[]; // Already uploaded document IDs

  // step 1 - Languages
  languagesSpoken?: string[];

  // step 3 - IME Background & Experience
  imesCompleted?: string;
  currentlyConductingIMEs?: boolean;
  assessmentTypes?: string[];
  redactedIMEReport?: File; // Optional file
  existingRedactedIMEReportDocumentId?: string; // Already uploaded document ID

  // step 4
  experienceDetails?: string;

  // step 6 - Legal
  agreeTermsConditions?: boolean;
  consentBackgroundVerification?: boolean;
};

const saveApplicationProgress = async (
  payload: SaveApplicationProgressInput
) => {
  try {
    if (!payload.email) {
      throw HttpError.badRequest("Email is required to save application");
    }

    // Check if a DRAFT or existing application exists for this email
    const existingApplication = await prisma.examinerApplication.findUnique({
      where: {
        email: payload.email,
      },
      include: {
        address: true,
      },
    });

    // Process file uploads if any
    let medicalLicenseDocumentIds: string[] = [];
    let redactedIMEReportDocumentId: string | undefined;

    // Handle medical license files
    if (payload.medicalLicense) {
      const files = Array.isArray(payload.medicalLicense)
        ? payload.medicalLicense
        : [payload.medicalLicense];

      const uploadPromises = files.map((file) => uploadFileToS3(file));
      const uploadResults = await Promise.all(uploadPromises);

      const successfulUploads = uploadResults.filter((r) => r.success);
      medicalLicenseDocumentIds = successfulUploads.map(
        (r) => r.document.id
      );
    }

    // Merge with existing document IDs if provided
    if (payload.existingMedicalLicenseDocumentIds) {
      medicalLicenseDocumentIds = [
        ...payload.existingMedicalLicenseDocumentIds,
        ...medicalLicenseDocumentIds,
      ];
    }

    // Handle redacted IME report file
    if (payload.redactedIMEReport) {
      const uploadResult = await uploadFileToS3(payload.redactedIMEReport);
      if (uploadResult.success) {
        redactedIMEReportDocumentId = uploadResult.document.id;
      }
    } else if (payload.existingRedactedIMEReportDocumentId) {
      redactedIMEReportDocumentId = payload.existingRedactedIMEReportDocumentId;
    }

    // Prepare address data
    let addressId: string | undefined;
    if (
      payload.address ||
      payload.street ||
      payload.suite ||
      payload.postalCode ||
      payload.province ||
      payload.city
    ) {
      if (existingApplication?.addressId) {
        // Update existing address
        const updatedAddress = await prisma.address.update({
          where: { id: existingApplication.addressId },
          data: {
            address: payload.address || existingApplication.address?.address || "",
            street: payload.street ?? existingApplication.address?.street ?? null,
            suite: payload.suite ?? existingApplication.address?.suite ?? null,
            postalCode:
              payload.postalCode ?? existingApplication.address?.postalCode ?? null,
            province:
              payload.province ?? existingApplication.address?.province ?? null,
            city: payload.city ?? existingApplication.address?.city ?? null,
          },
        });
        addressId = updatedAddress.id;
      } else {
        // Create new address
        const newAddress = await prisma.address.create({
          data: {
            address: payload.address || "",
            street: payload.street || null,
            suite: payload.suite || null,
            postalCode: payload.postalCode || null,
            province: payload.province || null,
            city: payload.city || null,
          },
        });
        addressId = newAddress.id;
      }
    } else if (existingApplication?.addressId) {
      addressId = existingApplication.addressId;
    }

    // Prepare update/create data
    const applicationData: Record<string, unknown> = {
      // Personal Information (only update if provided)
      ...(payload.firstName !== undefined && { firstName: payload.firstName }),
      ...(payload.lastName !== undefined && { lastName: payload.lastName }),
      ...(payload.phone !== undefined && { phone: payload.phone || null }),
      ...(payload.landlineNumber !== undefined && {
        landlineNumber: payload.landlineNumber || null,
      }),
      ...(payload.province !== undefined && {
        provinceOfResidence: payload.province || "",
      }),
      ...(payload.address !== undefined && {
        mailingAddress: payload.address || "",
      }),

      // Medical Credentials
      ...(payload.specialties !== undefined && {
        specialties: payload.specialties,
      }),
      ...(payload.licenseNumber !== undefined && {
        licenseNumber: payload.licenseNumber,
      }),
      ...(payload.licenseIssuingProvince !== undefined && {
        provinceOfLicensure: payload.licenseIssuingProvince || null,
      }),
      ...(payload.yearsOfIMEExperience !== undefined && {
        yearsOfIMEExperience: payload.yearsOfIMEExperience,
      }),
      ...(payload.licenseExpiryDate !== undefined && {
        licenseExpiryDate: payload.licenseExpiryDate || null,
      }),
      ...(medicalLicenseDocumentIds.length > 0 && {
        medicalLicenseDocumentIds: medicalLicenseDocumentIds,
      }),

      // IME Background
      ...(payload.imesCompleted !== undefined && {
        imesCompleted: payload.imesCompleted || null,
      }),
      ...(payload.currentlyConductingIMEs !== undefined && {
        currentlyConductingIMEs: payload.currentlyConductingIMEs || null,
      }),
      ...(payload.assessmentTypes !== undefined && {
        assessmentTypeIds: payload.assessmentTypes,
      }),
      ...(payload.experienceDetails !== undefined && {
        experienceDetails: payload.experienceDetails || null,
      }),

      // Languages
      ...(payload.languagesSpoken !== undefined && {
        languagesSpoken: payload.languagesSpoken || [],
      }),

      // Consent (only update if provided)
      ...(payload.consentBackgroundVerification !== undefined && {
        isConsentToBackgroundVerification:
          payload.consentBackgroundVerification,
      }),
      ...(payload.agreeTermsConditions !== undefined && {
        agreeToTerms: payload.agreeTermsConditions,
      }),

      // Always set status to DRAFT when saving progress
      status: ExaminerStatus.DRAFT,
    };

    // Add address connection if we have an addressId
    if (addressId) {
      applicationData.address = {
        connect: { id: addressId },
      };
    }

    // Add redacted IME report connection if we have a document ID
    if (redactedIMEReportDocumentId) {
      applicationData.redactedIMEReportDocument = {
        connect: { id: redactedIMEReportDocumentId },
      };
    }

    let application;
    if (existingApplication) {
      // Update existing application
      application = await prisma.examinerApplication.update({
        where: { id: existingApplication.id },
        data: applicationData,
      });
    } else {
      // Create new draft application
      application = await prisma.examinerApplication.create({
        data: {
          ...applicationData,
          email: payload.email,
          // Set defaults for required fields if not provided
          firstName: payload.firstName || "",
          lastName: payload.lastName || "",
          provinceOfResidence: payload.province || "",
          mailingAddress: payload.address || "",
          licenseNumber: payload.licenseNumber || "",
          yearsOfIMEExperience: payload.yearsOfIMEExperience || "",
          medicalLicenseDocumentIds: medicalLicenseDocumentIds,
          isForensicAssessmentTrained: false,
          isConsentToBackgroundVerification:
            payload.consentBackgroundVerification || false,
          agreeToTerms: payload.agreeTermsConditions || false,
        },
      });
    }

    // Invalidate all previous secure links for this application
    const existingSecureLinks = await prisma.applicationSecureLink.findMany({
      where: {
        applicationId: application.id,
      },
      include: {
        secureLink: true,
      },
    });

    // Mark all previous secure links as INVALID
    if (existingSecureLinks.length > 0) {
      const secureLinkIds = existingSecureLinks.map((link) => link.secureLinkId);
      await prisma.secureLink.updateMany({
        where: {
          id: { in: secureLinkIds },
          status: SecureLinkStatus.PENDING,
        },
        data: {
          status: SecureLinkStatus.INVALID,
        },
      });
    }

    // Generate a new secure token (cryptographically secure)
    const token = randomBytes(32).toString("base64url");

    // Create expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create new secure link
    const secureLink = await prisma.secureLink.create({
      data: {
        token,
        expiresAt,
        status: SecureLinkStatus.PENDING,
      },
    });

    // Link the secure link to the application
    await prisma.applicationSecureLink.create({
      data: {
        applicationId: application.id,
        secureLinkId: secureLink.id,
      },
    });

    return {
      success: true,
      message: "Application progress saved successfully",
      applicationId: application.id,
      token, // Return token to be used in the resume link
    };
  } catch (error) {
    throw HttpError.fromError(
      error,
      ErrorMessages.REGISTRATION_FAILED,
      500
    );
  }
};

export default saveApplicationProgress;

