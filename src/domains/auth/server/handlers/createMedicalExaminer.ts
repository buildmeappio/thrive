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
  medicalLicenseDocumentId: string;
  resumeDocumentId?: string; // Optional - CV/Resume will be added later

  // step 1 - Languages
  languagesSpoken: string[];

  // step 3 - IME Background & Experience
  imesCompleted: string;
  currentlyConductingIMEs: boolean;
  insurersOrClinics?: string;
  assessmentTypes: string[];
  assessmentTypeOther?: string;
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

    // Create address
    const address = await prisma.address.create({
      data: {
        address: payload.address,
        street: payload.street || null,
        suite: payload.suite || null,
        postalCode: payload.postalCode || null,
        province: payload.province || null,
        city: payload.city || null,
      },
    });

    // Create examiner profile
    const examinerProfile = await prisma.examinerProfile.create({
      data: {
        account: {
          connect: { id: account.id },
        },
        address: {
          connect: { id: address.id },
        },
        provinceOfResidence: payload.province || "", // Use address province as residence
        mailingAddress: payload.address, // Keep mailingAddress for backward compatibility
        landlineNumber: payload.landlineNumber,
        specialties: payload.specialties,
        licenseNumber: payload.licenseNumber,
        provinceOfLicensure: payload.licenseIssuingProvince,
        ...(payload.licenseExpiryDate && {
          licenseExpiryDate: payload.licenseExpiryDate,
        }),
        medicalLicenseDocument: {
          connect: { id: payload.medicalLicenseDocumentId },
        },
        ...(payload.resumeDocumentId && {
          resumeDocument: {
            connect: { id: payload.resumeDocumentId },
          },
        }),
        yearsOfIMEExperience: payload.yearsOfIMEExperience,
        assessmentTypes: payload.assessmentTypes,
        imesCompleted: payload.imesCompleted,
        currentlyConductingIMEs: payload.currentlyConductingIMEs,
        ...(payload.insurersOrClinics && {
          insurersOrClinics: payload.insurersOrClinics,
        }),
        ...(payload.assessmentTypeOther && {
          assessmentTypeOther: payload.assessmentTypeOther,
        }),
        ...(payload.redactedIMEReportDocumentId && {
          redactedIMEReportDocument: {
            connect: { id: payload.redactedIMEReportDocumentId },
          },
        }),
        isForensicAssessmentTrained: payload.forensicAssessmentTrained ?? false,
        // ndaDocument: {
        //   connect: { id: payload.signedNDADocumentId },
        // },
        agreeToTerms: payload.agreeTermsConditions,
        isConsentToBackgroundVerification:
          payload.consentBackgroundVerification,
        bio: payload.experienceDetails || "",
        // insuranceDocument: {
        //   connect: { id: payload.insuranceProofDocumentId },
        // },
        status: ExaminerStatus.SUBMITTED,
      },
    });

    // Create languages, payment terms, availability provider, and send email in parallel
    const languagePromises = [];
    if (payload.languagesSpoken && payload.languagesSpoken.length > 0) {
      languagePromises.push(
        prisma.examinerLanguage.createMany({
          data: payload.languagesSpoken.map((language) => ({
            examinerProfileId: examinerProfile.id,
            languageId: language,
          })),
        })
      );
    }
    
    await Promise.all([
      ...languagePromises,
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
      examinerProfileId: examinerProfile.id,
    };
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.REGISTRATION_FAILED, 500);
  }
};

export default createMedicalExaminer;
