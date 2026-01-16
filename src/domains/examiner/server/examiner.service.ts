import prisma from "@/lib/db";
import {
  ExaminerStatus,
  UserStatus,
  ContractStatus,
  Prisma,
} from "@prisma/client";

const includeRelations = {
  account: {
    include: {
      user: true,
    },
  },
  feeStructure: true,
  address: true,
  redactedIMEReportDocument: true,
  resumeDocument: true,
  ndaDocument: true,
  insuranceDocument: true,
  examinerLanguages: {
    include: {
      language: true,
    },
  },
  application: {
    select: {
      status: true,
    },
  },
  contracts: {
    where: {
      status: {
        in: [ContractStatus.DRAFT, ContractStatus.SENT, ContractStatus.SIGNED],
      },
    },
    select: {
      id: true,
      status: true,
      data: true,
      fieldValues: true, // Include fieldValues to access fees_overrides
      feeStructure: {
        include: {
          variables: {
            orderBy: [
              { sortOrder: Prisma.SortOrder.asc },
              { createdAt: Prisma.SortOrder.asc },
            ],
          },
        },
      },
      createdAt: true,
      sentAt: true,
    },
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: 1, // Get the most recent contract
  },
};

export const getRecentExaminers = async (
  limit?: number,
  status?: string | string[],
) => {
  return prisma.examinerProfile.findMany({
    where: {
      deletedAt: null,
      // Check ExaminerProfile.status for workflow statuses
      // User.status only tracks ACTIVE/SUSPENDED/REJECTED after password creation
      ...(status && {
        status: Array.isArray(status)
          ? { in: status as any[] }
          : (status as any),
      }),
    },
    include: includeRelations,
    orderBy: {
      createdAt: "desc",
    },
    take: limit || 10,
  });
};

export const getExaminerById = async (id: string) => {
  return prisma.examinerProfile.findUnique({
    where: { id },
    include: includeRelations,
  });
};

export const approveExaminer = async (id: string, _accountId?: string) => {
  const profile = await prisma.examinerProfile.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!profile) {
    throw new Error("Examiner profile not found");
  }

  // Update ExaminerProfile status to APPROVED (workflow status)
  await prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.APPROVED,
    },
  });

  return prisma.examinerProfile.findUnique({
    where: { id },
    include: includeRelations,
  });
};

export const rejectExaminer = async (
  id: string,
  accountId?: string,
  rejectionReason?: string,
) => {
  // Rejection happens during the application workflow (before account creation)
  // Only update ExaminerProfile.status, not User.status
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.REJECTED,
      rejectedReason: rejectionReason,
    },
    include: includeRelations,
  });
};

export const requestMoreInfoFromExaminer = async (
  id: string,
  _message: string,
  _documentsRequired: boolean,
) => {
  // Note: message and documentsRequired are sent via email but not stored in DB
  // as these fields don't exist in the schema

  // Update ExaminerProfile status to MORE_INFO_REQUESTED (workflow status)
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.MORE_INFO_REQUESTED,
    },
    include: includeRelations,
  });
};

// New status transition methods
export const moveToReview = async (id: string) => {
  // Update ExaminerProfile status to IN_REVIEW (workflow status)
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.IN_REVIEW,
    },
    include: includeRelations,
  });
};

export const scheduleInterview = async (id: string) => {
  // Update ExaminerProfile status to INTERVIEW_SCHEDULED (workflow status)
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_SCHEDULED,
    },
    include: includeRelations,
  });
};

export const markInterviewCompleted = async (id: string) => {
  // Update ExaminerProfile status to INTERVIEW_COMPLETED (workflow status)
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.INTERVIEW_COMPLETED,
    },
    include: includeRelations,
  });
};

export const markContractSigned = async (id: string) => {
  // Update ExaminerProfile status to CONTRACT_SIGNED (workflow status)
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.CONTRACT_SIGNED,
      contractConfirmedByAdminAt: new Date(),
    },
    include: includeRelations,
  });
};

// Suspend and reactivate methods
export const suspendExaminer = async (
  id: string,
  suspensionReason?: string,
) => {
  const profile = await prisma.examinerProfile.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!profile) {
    throw new Error("Examiner profile not found");
  }

  // Update User status to SUSPENDED (affects account access)
  await prisma.user.update({
    where: { id: profile.account.userId },
    data: {
      status: UserStatus.SUSPENDED,
    },
  });

  // Update ExaminerProfile status and suspension reason
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.SUSPENDED,
      rejectedReason: suspensionReason, // Reuse this field for suspension reason
    },
    include: includeRelations,
  });
};

export const reactivateExaminer = async (id: string) => {
  const profile = await prisma.examinerProfile.findUnique({
    where: { id },
    include: { account: true },
  });

  if (!profile) {
    throw new Error("Examiner profile not found");
  }

  // Update User status to ACTIVE (restores account access)
  await prisma.user.update({
    where: { id: profile.account.userId },
    data: {
      status: UserStatus.ACTIVE,
    },
  });

  // Update ExaminerProfile status to ACTIVE and clear suspension reason
  return prisma.examinerProfile.update({
    where: { id },
    data: {
      status: ExaminerStatus.ACTIVE,
      rejectedReason: null, // Clear any suspension reason
    },
    include: includeRelations,
  });
};

// Export for getExaminerCountThisMonth used by handlers
export const getExaminerCountThisMonth = async (status: string | string[]) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // For workflow statuses (SUBMITTED, IN_REVIEW, etc.), only check ExaminerProfile.status
  // User.status only tracks ACTIVE/SUSPENDED/REJECTED, not workflow statuses
  return prisma.examinerProfile.count({
    where: {
      // Check ExaminerProfile.status for all workflow statuses
      status: Array.isArray(status) ? { in: status as any[] } : (status as any),
      createdAt: {
        gte: startOfMonth,
      },
      deletedAt: null,
    },
  });
};

// Copy data from ExaminerApplication to ExaminerProfile when account is created
export const createProfileFromApplication = async (
  applicationId: string,
  accountId: string,
) => {
  // Get the application with all relations
  const application = await prisma.examinerApplication.findUnique({
    where: { id: applicationId },
    include: {
      address: true,
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Check if application is deleted
  if (application.deletedAt) {
    throw new Error("Application has been deleted");
  }

  // Validate that the application is APPROVED or CONTRACT_SIGNED before allowing account creation
  // CONTRACT_SIGNED: Contract has been signed, waiting for admin approval
  // APPROVED: Application has been approved, ready for account creation
  if (
    application.status !== ExaminerStatus.APPROVED &&
    application.status !== ExaminerStatus.CONTRACT_SIGNED
  ) {
    throw new Error(
      `Application is not approved. Current status: ${application.status}. Application must be APPROVED or CONTRACT_SIGNED to create account.`,
    );
  }

  // Check if profile already exists
  const existingProfile = await prisma.examinerProfile.findUnique({
    where: { applicationId },
  });

  if (existingProfile) {
    // Profile already exists, return it
    return prisma.examinerProfile.findUnique({
      where: { id: existingProfile.id },
      include: includeRelations,
    });
  }

  // Create ExaminerProfile from ExaminerApplication data and update application status to ACTIVE
  // This happens when examiner creates their password/account
  const profile = await prisma.$transaction(async (tx) => {
    // Create the profile
    const createdProfile = await tx.examinerProfile.create({
      data: {
        applicationId: application.id,
        accountId: accountId,
        addressId: application.addressId,
        provinceOfResidence: application.provinceOfResidence,
        mailingAddress: application.mailingAddress,
        specialties: application.specialties,
        licenseNumber: application.licenseNumber,
        landlineNumber: application.landlineNumber,
        assessmentTypes: application.assessmentTypeIds,
        provinceOfLicensure: application.provinceOfLicensure,
        licenseExpiryDate: application.licenseExpiryDate,
        medicalLicenseDocumentIds: application.medicalLicenseDocumentIds,
        resumeDocumentId: application.resumeDocumentId,
        NdaDocumentId: application.NdaDocumentId,
        insuranceDocumentId: application.insuranceDocumentId,
        isForensicAssessmentTrained: application.isForensicAssessmentTrained,
        yearsOfIMEExperience: application.yearsOfIMEExperience,
        imesCompleted: application.imesCompleted,
        currentlyConductingIMEs: application.currentlyConductingIMEs,
        insurersOrClinics: application.insurersOrClinics,
        assessmentTypeOther: application.assessmentTypeOther,
        redactedIMEReportDocumentId: application.redactedIMEReportDocumentId,
        bio: application.experienceDetails || "",
        experienceDetails: application.experienceDetails || "",
        isConsentToBackgroundVerification:
          application.isConsentToBackgroundVerification,
        agreeToTerms: application.agreeToTerms,
        // Note: Status is now stored in User model, not ExaminerProfile
      },
      include: includeRelations,
    });

    // Get the account to find the userId
    const account = await tx.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Set User status to ACTIVE when examiner creates account/password
    await tx.user.update({
      where: { id: account.userId },
      data: {
        status: UserStatus.ACTIVE,
      },
    });

    // Create fee structure from application fee structure if it exists
    if (
      application.IMEFee !== null &&
      application.recordReviewFee !== null &&
      application.cancellationFee !== null &&
      application.paymentTerms !== null
    ) {
      await tx.examinerFeeStructure.create({
        data: {
          examinerProfileId: createdProfile.id,
          IMEFee: application.IMEFee,
          recordReviewFee: application.recordReviewFee,
          hourlyRate: application.hourlyRate ?? null,
          cancellationFee: application.cancellationFee,
          paymentTerms: application.paymentTerms,
        },
      });
    }

    // Link any contracts from the application to the new profile
    await tx.contract.updateMany({
      where: {
        applicationId: applicationId,
        examinerProfileId: null,
      },
      data: {
        examinerProfileId: createdProfile.id,
        applicationId: null, // Remove application link since we now have a profile
      },
    });

    // Update application status to ACTIVE when examiner creates account
    await tx.examinerApplication.update({
      where: { id: applicationId },
      data: {
        status: ExaminerStatus.ACTIVE,
      },
    });

    return createdProfile;
  });

  return profile;
};

// Default export for backward compatibility
const examinerService = {
  getRecentExaminers,
  getExaminerById,
  approveExaminer,
  rejectExaminer,
  requestMoreInfoFromExaminer,
  moveToReview,
  scheduleInterview,
  markInterviewCompleted,
  markContractSigned,
  suspendExaminer,
  reactivateExaminer,
  getExaminerCountThisMonth,
  createProfileFromApplication,
};

export default examinerService;
