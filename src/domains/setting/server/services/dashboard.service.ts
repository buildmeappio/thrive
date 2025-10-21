import prisma from "@/lib/db";
import { uploadFileToS3 } from "@/lib/s3";

class DashboardService {
  /**
   * Get examiner profile details by account ID
   */
  async getExaminerProfileByAccountId(accountId: string) {
    const examinerProfile = await prisma.examinerProfile.findFirst({
      where: {
        accountId,
        deletedAt: null,
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
        examinerLanguages: {
          include: {
            language: true,
          },
        },
        medicalLicenseDocument: true,
        resumeDocument: true,
      },
    });

    return examinerProfile;
  }

  /**
   * Update examiner profile info
   */
  async updateExaminerProfileInfo(
    examinerProfileId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      landlineNumber?: string;
      emailAddress?: string;
      provinceOfResidence?: string;
      mailingAddress?: string;
      bio?: string;
      profilePhotoId?: string | null;
      activationStep?: string;
    }
  ) {
    // Update user data
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
      include: { account: true },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Update user information
    if (
      data.firstName ||
      data.lastName ||
      data.phoneNumber ||
      data.emailAddress ||
      data.profilePhotoId !== undefined
    ) {
      await prisma.user.update({
        where: { id: examinerProfile.account.userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.phoneNumber && { phone: data.phoneNumber }),
          ...(data.emailAddress && { email: data.emailAddress }),
          ...(data.profilePhotoId !== undefined && {
            profilePhotoId: data.profilePhotoId,
          }),
        },
      });
    }

    // Update examiner profile
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.provinceOfResidence && {
          provinceOfResidence: data.provinceOfResidence,
        }),
        ...(data.mailingAddress && {
          mailingAddress: data.mailingAddress,
        }),
        ...(data.landlineNumber !== undefined && {
          landlineNumber: data.landlineNumber,
        }),
        ...(data.bio && {
          bio: data.bio,
        }),
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
      },
      include: {
        account: {
          include: {
            user: true,
          },
        },
      },
    });

    return updatedProfile;
  }

  /**
   * Update examiner specialty preferences
   */
  async updateSpecialtyPreferences(
    examinerProfileId: string,
    data: {
      specialties?: string[];
      assessmentTypes?: string[];
      preferredRegions?: string;
      acceptVirtualAssessments?: boolean;
      languagesSpoken?: string[];
      activationStep?: string;
    }
  ) {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Update examiner profile
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.specialties && { specialties: data.specialties }),
        ...(data.assessmentTypes && { assessmentTypes: data.assessmentTypes }),
        ...(data.preferredRegions !== undefined && {
          preferredRegions: data.preferredRegions,
        }),
        ...(data.acceptVirtualAssessments !== undefined && {
          acceptVirtualAssessments: data.acceptVirtualAssessments,
        }),
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
      },
    });

    // Update languages if provided
    if (data.languagesSpoken && data.languagesSpoken.length > 0) {
      // Delete existing languages
      await prisma.examinerLanguage.deleteMany({
        where: { examinerProfileId },
      });

      // Create new language associations
      await prisma.examinerLanguage.createMany({
        data: data.languagesSpoken.map((languageId) => ({
          examinerProfileId,
          languageId,
        })),
      });
    }

    return updatedProfile;
  }

  /**
   * Update examiner payout details
   */
  async updatePayoutDetails(
    examinerProfileId: string,
    data: {
      payoutMethod?: "direct_deposit" | "cheque" | "interac";
      transitNumber?: string;
      institutionNumber?: string;
      accountNumber?: string;
      chequeMailingAddress?: string;
      interacEmail?: string;
      activationStep?: string;
    }
  ) {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Update examiner profile
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.payoutMethod && { payoutMethod: data.payoutMethod }),
        ...(data.transitNumber !== undefined && {
          transitNumber: data.transitNumber,
        }),
        ...(data.institutionNumber !== undefined && {
          institutionNumber: data.institutionNumber,
        }),
        ...(data.accountNumber !== undefined && {
          accountNumber: data.accountNumber,
        }),
        ...(data.chequeMailingAddress !== undefined && {
          chequeMailingAddress: data.chequeMailingAddress,
        }),
        ...(data.interacEmail !== undefined && {
          interacEmail: data.interacEmail,
        }),
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
      },
    });

    return updatedProfile;
  }

  // Add to dashboard.service.ts
  async uploadProfilePhoto(file: File) {
    const uploadResult = await uploadFileToS3(file);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || "Failed to upload profile photo");
    }

    // Construct CDN URL
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
    const profilePhotoUrl = cdnUrl
      ? `${cdnUrl}/documents/examiner/${uploadResult.document.name}`
      : null;

    return {
      documentId: uploadResult.document.id,
      profilePhotoUrl,
      document: uploadResult.document,
    };
  }
}

export const dashboardService = new DashboardService();
