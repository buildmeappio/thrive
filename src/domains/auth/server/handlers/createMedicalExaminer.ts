import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import { Roles } from "../../constants/roles";
import { ExaminerStatus } from "@prisma/client";
import emailService from "@/services/email.service";
import { signPasswordToken } from "@/lib/jwt";

export type CreateMedicalExaminerInput = {
  // step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  provinceOfResidence: string;
  mailingAddress: string;

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
  // signedNDADocumentId: string;
  // insuranceProofDocumentId: string;
  agreeTermsConditions: boolean;
  consentBackgroundVerification: boolean;
};

const createMedicalExaminer = async (payload: CreateMedicalExaminerInput) => {
  try {
    let user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    // get role
    const role = await prisma.role.findFirst({
      where: {
        name: Roles.MEDICAL_EXAMINER,
      },
    });

    if (!role) {
      throw HttpError.notFound("MEDICAL_EXAMINER role not found");
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          email: payload.email,
          phone: payload.phone,
          password: "invalid",
        },
      });
    }

    // Create account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        roleId: role?.id,
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
        // insuranceDocument: {
        //   connect: { id: payload.insuranceProofDocumentId },
        // },
        status: ExaminerStatus.PENDING,
      },
    });

    await prisma.examinerLanguage.createMany({
      data: payload.languagesSpoken.map((language) => ({
        examinerProfileId: examinerProfile.id,
        languageId: language,
      })),
    });

    const token = signPasswordToken({
      email: payload.email,
      id: user.id,
      accountId: account.id,
      role: Roles.MEDICAL_EXAMINER,
    });

    await emailService.sendEmail(
      "Welcome to Thrive",
      "welcome.html",
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        createAccountLink: `${process.env.NEXT_PUBLIC_APP_URL}/create-account?token=${token}`,
      },
      payload.email
    );

    return {
      success: true,
      message: "Medical examiner created successfully",
    };
  } catch (error) {
    throw HttpError.fromError(error, "Failed to create medical examiner", 500);
  }
};

export default createMedicalExaminer;
