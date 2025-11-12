import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { Roles } from "../../constants/roles";
import { ExaminerStatus } from "@prisma/client";
import { emailService } from "@/server";
import ErrorMessages from "@/constants/ErrorMessages";

export type CreateMedicalExaminerInput = {
  // step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  provinceOfResidence: string;
  mailingAddress: string;
  landlineNumber: string;

  // step 2
  specialties: string[];
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: Date;
  medicalLicenseDocumentId: string;
  resumeDocumentId: string;

  // step 3
  yearsOfIMEExperience: string;
  languagesSpoken: string[];
  forensicAssessmentTrained: boolean;

  // step 4
  experienceDetails?: string;

  // step 5
  preferredRegions?: string[];
  maxTravelDistance?: string;
  acceptVirtualAssessments?: boolean;

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
    // Fetch user and role in parallel
    const [existingUser, role] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      }),
      prisma.role.findFirst({
        where: {
          name: Roles.MEDICAL_EXAMINER,
        },
      }),
    ]);

    if (!role) {
      throw HttpError.notFound(ErrorMessages.ROLE_NOT_FOUND);
    }

    // Create user if doesn't exist
    const user =
      existingUser ||
      (await prisma.user.create({
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          password: "invalid",
        },
      }));

    // Create account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        roleId: role.id,
        isVerified: false,
      },
    });

    // Create examiner profile
    const examinerProfile = await prisma.examinerProfile.create({
      data: {
        account: {
          connect: { id: account.id },
        },
        provinceOfResidence: payload.provinceOfResidence,
        mailingAddress: payload.mailingAddress,
        landlineNumber: payload.landlineNumber,
        specialties: payload.specialties,
        licenseNumber: payload.licenseNumber,
        provinceOfLicensure: payload.provinceOfLicensure,
        licenseExpiryDate: payload.licenseExpiryDate,
        medicalLicenseDocument: {
          connect: { id: payload.medicalLicenseDocumentId },
        },
        resumeDocument: {
          connect: { id: payload.resumeDocumentId },
        },
        yearsOfIMEExperience: payload.yearsOfIMEExperience,
        isForensicAssessmentTrained: payload.forensicAssessmentTrained,
        // ndaDocument: {
        //   connect: { id: payload.signedNDADocumentId },
        // },
        agreeToTerms: payload.agreeTermsConditions,
        isConsentToBackgroundVerification:
          payload.consentBackgroundVerification,
        bio: payload.experienceDetails || "",
        preferredRegions: payload.preferredRegions?.join(","),
        maxTravelDistance: payload.maxTravelDistance,
        acceptVirtualAssessments: payload.acceptVirtualAssessments,
        // insuranceDocument: {
        //   connect: { id: payload.insuranceProofDocumentId },
        // },
        status: ExaminerStatus.PENDING,
      },
    });

    // Create languages, payment terms, availability provider, and send email in parallel
    await Promise.all([
      prisma.examinerLanguage.createMany({
        data: payload.languagesSpoken.map((language) => ({
          examinerProfileId: examinerProfile.id,
          languageId: language,
        })),
      }),
      // prisma.examinerFeeStructure.create({
      //   data: {
      //     examinerProfileId: examinerProfile.id,
      //     IMEFee: parseFloat(payload.IMEFee) || 0,
      //     recordReviewFee: parseFloat(payload.recordReviewFee) || 0,
      //     hourlyRate:
      //       payload.hourlyRate && payload.hourlyRate.trim() !== ""
      //         ? parseFloat(payload.hourlyRate)
      //         : null,
      //     cancellationFee: parseFloat(payload.cancellationFee) || 0,
      //     paymentTerms: "",
      //   },
      // }),
      prisma.availabilityProvider.create({
        data: {
          providerType: "EXAMINER",
          refId: examinerProfile.id,
        },
      }),
      emailService.sendEmail(
        "Your Thrive Medical Examiner Application Has Been Received",
        "application-received.html",
        {
          firstName: payload.firstName,
          lastName: payload.lastName,
        },
        payload.email
      ),
    ]);

    return {
      success: true,
      message: "Medical examiner created successfully",
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.REGISTRATION_FAILED, 500);
  }
};

export default createMedicalExaminer;
