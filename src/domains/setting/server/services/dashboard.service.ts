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
        resumeDocument: true,
        ndaDocument: true,
        insuranceDocument: true,
        governmentIdDocument: true,
        redactedIMEReportDocument: true,
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
      emailAddress?: string;
      phoneNumber?: string;
      landlineNumber?: string;
      provinceOfResidence?: string;
      mailingAddress?: string;
      professionalTitle?: string;
      yearsOfExperience?: string;
      clinicName?: string;
      clinicAddress?: string;
      bio?: string;
      profilePhotoId?: string | null;
      activationStep?: string;
    },
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
      data.emailAddress ||
      data.phoneNumber !== undefined ||
      data.profilePhotoId !== undefined
    ) {
      await prisma.user.update({
        where: { id: examinerProfile.account.userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.emailAddress && { email: data.emailAddress }),
          ...(data.phoneNumber !== undefined && { phone: data.phoneNumber }),
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
        ...(data.landlineNumber !== undefined && {
          landlineNumber: data.landlineNumber,
        }),
        ...(data.provinceOfResidence && {
          provinceOfResidence: data.provinceOfResidence,
        }),
        ...(data.mailingAddress && {
          mailingAddress: data.mailingAddress,
        }),
        ...(data.professionalTitle && {
          professionalTitle: data.professionalTitle,
        }),
        ...(data.yearsOfExperience && {
          yearsOfIMEExperience: data.yearsOfExperience,
        }),
        ...(data.clinicName && {
          clinicName: data.clinicName,
        }),
        ...(data.clinicAddress && {
          clinicAddress: data.clinicAddress,
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
    },
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
      legalName?: string;
      sin?: string;
      transitNumber?: string;
      institutionNumber?: string;
      accountNumber?: string;
      chequeMailingAddress?: string;
      interacEmail?: string;
      autodepositEnabled?: boolean;
      activationStep?: string;
    },
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
        ...(data.payoutMethod !== undefined && { payoutMethod: data.payoutMethod }),
        ...(data.legalName !== undefined && {
          legalName: data.legalName,
        }),
        ...(data.sin !== undefined && {
          sin: data.sin,
        }),
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
        ...(data.autodepositEnabled !== undefined && {
          autodepositEnabled: data.autodepositEnabled,
        }),
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
      },
    });

    return updatedProfile;
  }

  /**
   * Update services & assessment types
   */
  async updateServicesAssessment(
    examinerProfileId: string,
    data: {
      assessmentTypes?: string[];
      acceptVirtualAssessments?: boolean;
      acceptInPersonAssessments?: boolean;
      travelToClaimants?: boolean;
      travelRadius?: string;
      assessmentTypeOther?: string;
      activationStep?: string;
    },
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
        ...(data.assessmentTypes && { assessmentTypes: data.assessmentTypes }),
        ...(data.acceptVirtualAssessments !== undefined && {
          acceptVirtualAssessments: data.acceptVirtualAssessments,
        }),
        // Note: acceptInPersonAssessments is not in the database schema yet
        // For now, we'll store it implicitly via acceptVirtualAssessments
        // If both virtual and in-person are false, acceptVirtualAssessments will be false
        // If either is true, we can set acceptVirtualAssessments accordingly
        ...(data.travelToClaimants !== undefined &&
          data.travelToClaimants &&
          data.travelRadius && {
            maxTravelDistance: data.travelRadius,
          }),
        ...(data.travelToClaimants !== undefined &&
          !data.travelToClaimants && {
            maxTravelDistance: null,
          }),
        ...(data.assessmentTypeOther !== undefined && {
          assessmentTypeOther: data.assessmentTypeOther,
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

  /**
   * Update examiner documents
   */
  async updateDocuments(
    examinerProfileId: string,
    data: {
      medicalLicenseDocumentIds?: string[];
      governmentIdDocumentId?: string;
      resumeDocumentId?: string;
      insuranceDocumentId?: string;
      specialtyCertificatesDocumentIds?: string[];
      activationStep?: string;
    },
  ) {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Note: governmentIdDocumentId and specialtyCertificatesDocumentIds
    // may need to be added to the ExaminerProfile schema
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.medicalLicenseDocumentIds !== undefined && {
          medicalLicenseDocumentIds: data.medicalLicenseDocumentIds,
        }),
        ...(data.resumeDocumentId !== undefined && {
          resumeDocumentId: data.resumeDocumentId,
        }),
        ...(data.insuranceDocumentId !== undefined && {
          insuranceDocumentId: data.insuranceDocumentId,
        }),
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
        // TODO: Add governmentIdDocumentId and specialtyCertificatesDocumentIds
        // to the schema when these fields are added
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
   * Update compliance acknowledgments
   */
  async updateCompliance(
    examinerProfileId: string,
    data: {
      phipaCompliance?: boolean;
      pipedaCompliance?: boolean;
      medicalLicenseActive?: boolean;
      activationStep?: string;
    },
  ) {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Note: phipaCompliance, pipedaCompliance, and medicalLicenseActive
    // may need to be added to the ExaminerProfile schema
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
        // TODO: Add these fields to the schema when they are added:
        // phipaCompliance, pipedaCompliance, medicalLicenseActive
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
   * Update notification settings
   */
  async updateNotifications(
    examinerProfileId: string,
    data: {
      emailNewIMEs?: boolean;
      emailInterviewRequests?: boolean;
      emailPaymentPayout?: boolean;
      smsNotifications?: boolean;
      emailMarketing?: boolean;
      activationStep?: string;
    },
  ) {
    const examinerProfile = await prisma.examinerProfile.findUnique({
      where: { id: examinerProfileId },
    });

    if (!examinerProfile) {
      throw new Error("Examiner profile not found");
    }

    // Note: notification settings may need to be added to the ExaminerProfile schema
    // or stored in a separate UserPreferences/NotificationSettings table
    const updatedProfile = await prisma.examinerProfile.update({
      where: { id: examinerProfileId },
      data: {
        ...(data.activationStep && {
          activationStep: data.activationStep,
        }),
        // TODO: Add notification fields to the schema when they are added:
        // emailNewIMEs, emailInterviewRequests, emailPaymentPayout, smsNotifications, emailMarketing
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
}

export const dashboardService = new DashboardService();
