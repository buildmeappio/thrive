import HttpError from "@/utils/httpError";
import { ExaminerStatus } from "@thrive/database";
import { emailService } from "@/server";
import ErrorMessages from "@/constants/ErrorMessages";
import prisma from "@/lib/db";
import { capitalizeFirstLetter } from "@/utils/text";

export type UpdateExaminerApplicationInput = {
  applicationId: string;
  // step 1
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  landlineNumber?: string;
  languagesSpoken?: string[];

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
  medicalLicenseDocumentIds?: string[];

  // step 3
  imesCompleted?: string;
  currentlyConductingIMEs?: boolean;
  assessmentTypes?: string[];
  redactedIMEReportDocumentId?: string;

  // step 4
  experienceDetails?: string;

  // step 6
  agreeTermsConditions?: boolean;
  consentBackgroundVerification?: boolean;
};

const updateExaminerApplication = async (
  payload: UpdateExaminerApplicationInput,
) => {
  try {
    // Get existing application
    const existingApplication = await prisma.examinerApplication.findUnique({
      where: {
        id: payload.applicationId,
      },
      include: {
        address: true,
      },
    });

    if (!existingApplication) {
      throw HttpError.notFound("Examiner application not found");
    }

    // Check if email is being changed and if new email already exists
    if (payload.email && payload.email !== existingApplication.email) {
      const emailExists = await prisma.examinerApplication.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (emailExists && emailExists.id !== payload.applicationId) {
        throw HttpError.badRequest(
          "An application with this email already exists",
        );
      }
    }

    // Update or create address
    let addressId = existingApplication.addressId;
    if (payload.address || payload.province || payload.city) {
      if (addressId) {
        // Update existing address
        await prisma.address.update({
          where: { id: addressId },
          data: {
            address:
              payload.address || existingApplication.mailingAddress || "",
            street: payload.street || null,
            suite: payload.suite || null,
            postalCode: payload.postalCode || null,
            province:
              payload.province ||
              existingApplication.provinceOfResidence ||
              null,
            city: payload.city || null,
          },
        });
      } else {
        // Create new address
        const newAddress = await prisma.address.create({
          data: {
            address:
              payload.address || existingApplication.mailingAddress || "",
            street: payload.street || null,
            suite: payload.suite || null,
            postalCode: payload.postalCode || null,
            province:
              payload.province ||
              existingApplication.provinceOfResidence ||
              null,
            city: payload.city || null,
          },
        });
        addressId = newAddress.id;
      }
    }

    // Update examiner application
    const updatedApplication = await prisma.examinerApplication.update({
      where: {
        id: payload.applicationId,
      },
      data: {
        // Personal Information - capitalize first letter
        ...(payload.firstName !== undefined && {
          firstName: capitalizeFirstLetter(payload.firstName),
        }),
        ...(payload.lastName !== undefined && {
          lastName: capitalizeFirstLetter(payload.lastName),
        }),
        ...(payload.email !== undefined && { email: payload.email }),
        ...(payload.phone !== undefined && { phone: payload.phone }),
        ...(payload.landlineNumber !== undefined && {
          landlineNumber: payload.landlineNumber,
        }),
        ...(addressId && { address: { connect: { id: addressId } } }),
        ...(payload.province !== undefined && {
          provinceOfResidence: payload.province,
        }),
        ...(payload.address !== undefined && {
          mailingAddress: payload.address,
        }),

        // Medical Credentials
        ...(payload.specialties !== undefined && {
          specialties: payload.specialties,
        }),
        ...(payload.licenseNumber !== undefined && {
          licenseNumber: payload.licenseNumber,
        }),
        ...(payload.licenseIssuingProvince !== undefined && {
          provinceOfLicensure: payload.licenseIssuingProvince,
        }),
        ...(payload.licenseExpiryDate !== undefined && {
          licenseExpiryDate: payload.licenseExpiryDate,
        }),
        ...(payload.medicalLicenseDocumentIds !== undefined && {
          medicalLicenseDocumentIds: payload.medicalLicenseDocumentIds,
        }),

        // IME Background
        ...(payload.yearsOfIMEExperience !== undefined && {
          yearsOfIMEExperience: payload.yearsOfIMEExperience,
        }),
        ...(payload.imesCompleted !== undefined && {
          imesCompleted: payload.imesCompleted,
        }),
        ...(payload.currentlyConductingIMEs !== undefined && {
          currentlyConductingIMEs: payload.currentlyConductingIMEs,
        }),
        ...(payload.assessmentTypes !== undefined && {
          assessmentTypeIds: payload.assessmentTypes,
        }),
        ...(payload.redactedIMEReportDocumentId !== undefined && {
          redactedIMEReportDocument: payload.redactedIMEReportDocumentId
            ? { connect: { id: payload.redactedIMEReportDocumentId } }
            : { disconnect: true },
        }),
        ...(payload.experienceDetails !== undefined && {
          experienceDetails: payload.experienceDetails,
        }),

        // Languages
        ...(payload.languagesSpoken !== undefined && {
          languagesSpoken: payload.languagesSpoken,
        }),

        // Consent
        ...(payload.agreeTermsConditions !== undefined && {
          agreeToTerms: payload.agreeTermsConditions,
        }),
        ...(payload.consentBackgroundVerification !== undefined && {
          isConsentToBackgroundVerification:
            payload.consentBackgroundVerification,
        }),

        // Reset status to SUBMITTED when application is updated
        status: ExaminerStatus.SUBMITTED,
      },
    });

    // Send update confirmation email
    await emailService.sendEmail(
      "Your Application Has Been Updated Successfully",
      "application-received.html",
      {
        firstName: updatedApplication.firstName || "",
        lastName: updatedApplication.lastName || "",
      },
      updatedApplication.email,
    );

    return {
      success: true,
      message: "Examiner application updated successfully",
      data: {
        applicationId: updatedApplication.id,
        status: updatedApplication.status,
      },
    };
  } catch (error) {
    throw HttpError.fromError(
      error,
      ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
      500,
    );
  }
};

export default updateExaminerApplication;
