import prisma from "@/lib/db";

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
      emailAddress?: string;
      provinceOfResidence?: string;
      mailingAddress?: string;
      bio?: string;
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
      data.emailAddress
    ) {
      await prisma.user.update({
        where: { id: examinerProfile.account.userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.phoneNumber && { phone: data.phoneNumber }),
          ...(data.emailAddress && { email: data.emailAddress }),
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
}

export const dashboardService = new DashboardService();
