import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import { ExaminerStatus } from "@prisma/client";

class ExaminerService {
  async getExaminerProfileById(examinerProfileId: string) {
    try {
      const examinerProfile = await prisma.examinerProfile.findUnique({
        where: {
          id: examinerProfileId,
        },
        include: {
          account: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!examinerProfile) {
        throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
      }

      return examinerProfile;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_FETCH_EXAMINER_PROFILE,
        500
      );
    }
  }

  async updateExaminerStatus(
    examinerProfileId: string,
    status: ExaminerStatus,
    approvedBy?: string
  ) {
    try {
      const updateData: {
        status: ExaminerStatus;
        approvedBy?: string | null;
        approvedAt?: Date;
        rejectedBy?: string | null;
        rejectedAt?: Date;
      } = {
        status,
      };

      if (status === ExaminerStatus.ACCEPTED) {
        updateData.approvedBy = approvedBy || null;
        updateData.approvedAt = new Date();
      } else if (status === ExaminerStatus.REJECTED) {
        updateData.rejectedBy = approvedBy || null;
        updateData.rejectedAt = new Date();
      }

      const updatedProfile = await prisma.examinerProfile.update({
        where: {
          id: examinerProfileId,
        },
        data: updateData,
      });

      return updatedProfile;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_UPDATE_EXAMINER_STATUS,
        500
      );
    }
  }

  validateExaminerStatus(status: ExaminerStatus, action: "approve" | "reject") {
    if (action === "approve") {
      if (status === ExaminerStatus.ACCEPTED) {
        throw HttpError.badRequest(ErrorMessages.EXAMINER_ALREADY_APPROVED);
      }
      if (status === ExaminerStatus.REJECTED) {
        throw HttpError.badRequest(
          ErrorMessages.CANNOT_APPROVE_REJECTED_EXAMINER
        );
      }
    } else if (action === "reject") {
      if (status === ExaminerStatus.REJECTED) {
        throw HttpError.badRequest(ErrorMessages.EXAMINER_ALREADY_REJECTED);
      }
    }
  }

  async getExaminerProfileWithDetails(examinerProfileId: string) {
    try {
      const examinerProfile = await prisma.examinerProfile.findUnique({
        where: {
          id: examinerProfileId,
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
          ndaDocument: true,
          insuranceDocument: true,
          feeStructure: true,
        },
      });

      if (!examinerProfile) {
        throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
      }

      return examinerProfile;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_FETCH_EXAMINER_PROFILE,
        500
      );
    }
  }

  async updateExaminerProfile(
    examinerProfileId: string,
    data: {
      // Step 1: Personal Info
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      provinceOfResidence?: string;
      mailingAddress?: string;
      landlineNumber?: string;

      // Step 2: Medical Credentials
      specialties?: string[];
      licenseNumber?: string;
      provinceOfLicensure?: string;
      licenseExpiryDate?: Date;
      medicalLicenseDocumentId?: string;
      resumeDocumentId?: string;

      // Step 3: IME Experience
      yearsOfIMEExperience?: string;
      languagesSpoken?: string[];
      forensicAssessmentTrained?: boolean;

      // Step 4: Experience Details
      experienceDetails?: string;

      // Step 5: Availability
      preferredRegions?: string[];
      maxTravelDistance?: string;
      acceptVirtualAssessments?: boolean;

      // Step 6: Legal
      signedNDADocumentId?: string;
      insuranceProofDocumentId?: string;
      agreeTermsConditions?: boolean;
      consentBackgroundVerification?: boolean;

      // Step 7: Payment Details
      standardIMEFee?: string;
      virtualIMEFee?: string;
      recordReviewFee?: string;
      hourlyRate?: string;
      reportTurnaroundDays?: string;
      cancellationFee?: string;
    }
  ) {
    try {
      const examinerProfile = await prisma.examinerProfile.findUnique({
        where: { id: examinerProfileId },
        include: { account: true },
      });

      if (!examinerProfile) {
        throw HttpError.notFound(ErrorMessages.EXAMINER_PROFILE_NOT_FOUND);
      }

      // Update user data if provided
      if (data.firstName || data.lastName || data.email || data.phone) {
        await prisma.user.update({
          where: { id: examinerProfile.account.userId },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.email && { email: data.email }),
            ...(data.phone && { phone: data.phone }),
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
          ...(data.mailingAddress && { mailingAddress: data.mailingAddress }),
          ...(data.landlineNumber && { landlineNumber: data.landlineNumber }),
          ...(data.specialties && { specialties: data.specialties }),
          ...(data.licenseNumber && { licenseNumber: data.licenseNumber }),
          ...(data.provinceOfLicensure && {
            provinceOfLicensure: data.provinceOfLicensure,
          }),
          ...(data.licenseExpiryDate && {
            licenseExpiryDate: data.licenseExpiryDate,
          }),
          ...(data.yearsOfIMEExperience && {
            yearsOfIMEExperience: data.yearsOfIMEExperience,
          }),
          ...(data.forensicAssessmentTrained !== undefined && {
            isForensicAssessmentTrained: data.forensicAssessmentTrained,
          }),
          ...(data.experienceDetails !== undefined && {
            bio: data.experienceDetails,
          }),
          ...(data.preferredRegions && {
            preferredRegions: data.preferredRegions.join(","),
          }),
          ...(data.maxTravelDistance && {
            maxTravelDistance: data.maxTravelDistance,
          }),
          ...(data.acceptVirtualAssessments !== undefined && {
            acceptVirtualAssessments: data.acceptVirtualAssessments,
          }),
          ...(data.agreeTermsConditions !== undefined && {
            agreeToTerms: data.agreeTermsConditions,
          }),
          ...(data.consentBackgroundVerification !== undefined && {
            isConsentToBackgroundVerification:
              data.consentBackgroundVerification,
          }),
          ...(data.medicalLicenseDocumentId && {
            medicalLicenseDocument: {
              connect: { id: data.medicalLicenseDocumentId },
            },
          }),
          ...(data.resumeDocumentId && {
            resumeDocument: { connect: { id: data.resumeDocumentId } },
          }),
          ...(data.signedNDADocumentId && {
            ndaDocument: { connect: { id: data.signedNDADocumentId } },
          }),
          ...(data.insuranceProofDocumentId && {
            insuranceDocument: {
              connect: { id: data.insuranceProofDocumentId },
            },
          }),
          // Change status from INFO_REQUESTED to PENDING
          status: ExaminerStatus.PENDING,
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

      // Update fee structure if provided
      if (
        data.standardIMEFee ||
        data.virtualIMEFee ||
        data.recordReviewFee ||
        data.cancellationFee
      ) {
        // Check if fee structure exists
        const existingFeeStructure =
          await prisma.examinerFeeStructure.findFirst({
            where: { examinerProfileId },
          });

        if (existingFeeStructure) {
          // Update existing fee structure
          await prisma.examinerFeeStructure.update({
            where: { id: existingFeeStructure.id },
            data: {
              ...(data.standardIMEFee && {
                standardIMEFee: parseFloat(data.standardIMEFee) || 0,
              }),
              ...(data.virtualIMEFee && {
                virtualIMEFee: parseFloat(data.virtualIMEFee) || 0,
              }),
              ...(data.recordReviewFee && {
                recordReviewFee: parseFloat(data.recordReviewFee) || 0,
              }),
              ...(data.hourlyRate !== undefined && {
                hourlyRate:
                  data.hourlyRate && data.hourlyRate.trim() !== ""
                    ? parseFloat(data.hourlyRate)
                    : null,
              }),
              ...(data.reportTurnaroundDays !== undefined && {
                reportTurnaroundDays:
                  data.reportTurnaroundDays &&
                  data.reportTurnaroundDays.trim() !== ""
                    ? parseInt(data.reportTurnaroundDays)
                    : null,
              }),
              ...(data.cancellationFee && {
                cancellationFee: parseFloat(data.cancellationFee) || 0,
              }),
              paymentTerms: "",
            },
          });
        } else {
          // Create new fee structure
          await prisma.examinerFeeStructure.create({
            data: {
              examinerProfileId,
              standardIMEFee: data.standardIMEFee
                ? parseFloat(data.standardIMEFee) || 0
                : 0,
              virtualIMEFee: data.virtualIMEFee
                ? parseFloat(data.virtualIMEFee) || 0
                : 0,
              recordReviewFee: data.recordReviewFee
                ? parseFloat(data.recordReviewFee) || 0
                : 0,
              hourlyRate:
                data.hourlyRate && data.hourlyRate.trim() !== ""
                  ? parseFloat(data.hourlyRate)
                  : null,
              reportTurnaroundDays:
                data.reportTurnaroundDays &&
                data.reportTurnaroundDays.trim() !== ""
                  ? parseInt(data.reportTurnaroundDays)
                  : null,
              cancellationFee: data.cancellationFee
                ? parseFloat(data.cancellationFee) || 0
                : 0,
              paymentTerms: "",
            },
          });
        }
      }

      return updatedProfile;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_UPDATE_EXAMINER_PROFILE,
        500
      );
    }
  }
}

export default new ExaminerService();
