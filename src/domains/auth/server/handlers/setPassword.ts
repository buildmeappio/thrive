import HttpError from "@/utils/httpError";
import bcrypt from "bcryptjs";
import { tokenService, userService, accountService } from "../services";
import ErrorMessages from "@/constants/ErrorMessages";
import { log } from "@/utils/logger";
import prisma from "@/lib/db";
import { Roles } from "../../constants/roles";
import { ExaminerStatus } from "@prisma/client";

export type SetPasswordInput = {
  password: string;
  confirmPassword: string;
  token: string;
  isPasswordReset?: boolean;
};

const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    throw HttpError.fromError(error, ErrorMessages.FAILED_SET_PASSWORD, 500);
  }
};

const setPassword = async (payload: SetPasswordInput) => {
  // Verify token and extract data
  const tokenData = tokenService.extractUserFromToken(payload.token);

  log(
    `[SetPassword] ${
      payload.isPasswordReset ? "Password reset" : "Account creation"
    } - Token data:`,
    tokenData
  );

  // Validate passwords match
  if (payload.password !== payload.confirmPassword) {
    throw HttpError.badRequest(ErrorMessages.PASSWORD_MISMATCH);
  }

  // Hash the password
  const hashedPassword = await hashPassword(payload.password);

  // If applicationId exists, create User, Account, ExaminerProfile from application
  if (tokenData.applicationId) {
    log(`[SetPassword] Creating account from application: ${tokenData.applicationId}`);

    // Get examiner application with all related data
    const application = await prisma.examinerApplication.findUnique({
      where: {
        id: tokenData.applicationId,
      },
      include: {
        address: true,
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        redactedIMEReportDocument: true,
      },
    });

    if (!application) {
      throw HttpError.notFound("Examiner application not found");
    }

    // Check if application is approved (can be ACCEPTED or APPROVED)
    const isApproved = 
      application.status === ExaminerStatus.ACCEPTED || 
      application.status === ExaminerStatus.APPROVED;
    
    if (!isApproved) {
      throw HttpError.badRequest(
        `Application is not approved. Current status: ${application.status}`
      );
    }

    // Check if profile already exists
    const existingProfile = await prisma.examinerProfile.findUnique({
      where: {
        applicationId: application.id,
      },
    });

    if (existingProfile) {
      // Profile already exists, just update password
      const user = await prisma.user.findUnique({
        where: {
          email: application.email,
        },
      });

      if (!user) {
        throw HttpError.notFound("User not found");
      }

      await userService.updateUserPassword(user.id, hashedPassword);
      await accountService.verifyAccount(existingProfile.accountId);

      return {
        success: true,
        message: "Password set successfully",
        data: user,
      };
    }

    // Get role
    const role = await prisma.role.findFirst({
      where: {
        name: Roles.MEDICAL_EXAMINER,
      },
    });

    if (!role) {
      throw HttpError.notFound("Medical examiner role not found");
    }

    // Create User
    const user = await prisma.user.create({
      data: {
        firstName: application.firstName || "",
        lastName: application.lastName || "",
        email: application.email,
        phone: application.phone || "",
        password: hashedPassword,
      },
    });

    // Create Account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        roleId: role.id,
        isVerified: true, // Auto-verify since application was approved
      },
    });

    // Create or reuse address
    let addressId = application.addressId;
    if (!addressId) {
      // No address linked, create one from application data
      const newAddress = await prisma.address.create({
        data: {
          address: application.mailingAddress,
          province: application.provinceOfResidence,
          ...(application.address && {
            city: application.address.city || null,
            street: application.address.street || null,
            suite: application.address.suite || null,
            postalCode: application.address.postalCode || null,
          }),
        },
      });
      addressId = newAddress.id;
    }

    // Create ExaminerProfile from application data
    const examinerProfile = await prisma.examinerProfile.create({
      data: {
        application: {
          connect: { id: application.id },
        },
        account: {
          connect: { id: account.id },
        },
        address: addressId
          ? {
              connect: { id: addressId },
            }
          : undefined,
        provinceOfResidence: application.provinceOfResidence,
        mailingAddress: application.mailingAddress,
        landlineNumber: application.landlineNumber,
        specialties: application.specialties,
        licenseNumber: application.licenseNumber,
        provinceOfLicensure: application.provinceOfLicensure,
        licenseExpiryDate: application.licenseExpiryDate,
        medicalLicenseDocumentIds: application.medicalLicenseDocumentIds,
        ...(application.resumeDocumentId && {
          resumeDocument: {
            connect: { id: application.resumeDocumentId },
          },
        }),
        ...(application.NdaDocumentId && {
          ndaDocument: {
            connect: { id: application.NdaDocumentId },
          },
        }),
        ...(application.insuranceDocumentId && {
          insuranceDocument: {
            connect: { id: application.insuranceDocumentId },
          },
        }),
        ...(application.redactedIMEReportDocumentId && {
          redactedIMEReportDocument: {
            connect: { id: application.redactedIMEReportDocumentId },
          },
        }),
        isForensicAssessmentTrained: application.isForensicAssessmentTrained,
        yearsOfIMEExperience: application.yearsOfIMEExperience,
        imesCompleted: application.imesCompleted,
        currentlyConductingIMEs: application.currentlyConductingIMEs,
        assessmentTypes: application.assessmentTypeIds, // Copy assessment type IDs
        experienceDetails: application.experienceDetails || null, // Map experienceDetails to experienceDetails
        bio: "", // Bio is required but will be filled during onboarding
        agreeToTerms: application.agreeToTerms,
        isConsentToBackgroundVerification:
          application.isConsentToBackgroundVerification,
        status: ExaminerStatus.ACTIVE, // Set to ACTIVE after password setup
      },
    });

    // Create ExaminerLanguage records from application languages
    if (application.languagesSpoken && application.languagesSpoken.length > 0) {
      await prisma.examinerLanguage.createMany({
        data: application.languagesSpoken.map((languageId) => ({
          examinerProfileId: examinerProfile.id,
          languageId: languageId,
        })),
        skipDuplicates: true,
      });
    }

    // Create ExaminerFeeStructure from application fee structure data
    if (
      application.IMEFee !== null ||
      application.recordReviewFee !== null ||
      application.hourlyRate !== null ||
      application.cancellationFee !== null ||
      application.paymentTerms
    ) {
      await prisma.examinerFeeStructure.create({
        data: {
          examinerProfileId: examinerProfile.id,
          IMEFee: application.IMEFee,
          recordReviewFee: application.recordReviewFee || 0, // Required field, default to 0 if null
          hourlyRate: application.hourlyRate,
          cancellationFee: application.cancellationFee || 0, // Required field, default to 0 if null
          paymentTerms: application.paymentTerms || "", // Required field, default to empty string if null
        },
      });
      log(`[SetPassword] Created fee structure from application`);
    }

    // Note: AvailabilityProvider will be created during onboarding when examiner adds their availability

    log(`[SetPassword] Successfully created account and profile from application`);

    return {
      success: true,
      message: "Password set and account created successfully",
      data: user,
    };
  }

  // Legacy flow: userId and accountId (for existing users or password reset)
  if (tokenData.userId && tokenData.accountId) {
    log(`[SetPassword] Updating password for existing user: ${tokenData.userId}`);

    // Update user password
    const user = await userService.updateUserPassword(
      tokenData.userId,
      hashedPassword
    );

    // Verify account
    await accountService.verifyAccount(tokenData.accountId);

    return {
      success: true,
      message: "Password set successfully",
      data: user,
    };
  }

  throw HttpError.badRequest("Invalid token format");
};

export default setPassword;
