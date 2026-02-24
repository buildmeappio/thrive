import {
  ExaminerProfile,
  Account,
  User,
  Documents,
  AvailabilityProvider,
  ProviderWeeklyHours,
  ProviderWeeklyTimeSlot,
} from '@thrive/database';
import { ExaminerProfileData, WeeklyAvailability } from '../../types/ExaminerProfileData';

type ExaminerProfileWithRelations = ExaminerProfile & {
  account: Account & {
    user: User & {
      profilePhoto: Documents | null;
    };
  };
  availabilityProvider?:
    | (AvailabilityProvider & {
        weeklyHours: (ProviderWeeklyHours & {
          timeSlots: ProviderWeeklyTimeSlot[];
        })[];
      })
    | null;
  governmentIdDocument?: Documents | null;
  resumeDocument?: Documents | null;
  insuranceDocument?: Documents | null;
};

export class ExaminerProfileDto {
  static toExaminerProfileData(
    examinerProfile: ExaminerProfileWithRelations,
    medicalLicenseUrls?: string[],
    specialtyCertificatesUrls?: string[],
    governmentIdUrl?: string,
    resumeUrl?: string,
    insuranceUrl?: string,
    profilePhotoUrl?: string,
    medicalLicenseNames?: string[],
    specialtyCertificatesNames?: string[],
    governmentIdName?: string,
    resumeName?: string,
    insuranceName?: string
  ): ExaminerProfileData {
    const user = examinerProfile.account.user;

    // Map weekly availability
    const weeklyAvailability: WeeklyAvailability[] = examinerProfile.availabilityProvider
      ? examinerProfile.availabilityProvider.weeklyHours.map(weeklyHour => ({
          id: weeklyHour.id,
          dayOfWeek: weeklyHour.dayOfWeek,
          enabled: weeklyHour.enabled,
          timeSlots: weeklyHour.timeSlots.map(slot => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        }))
      : [];

    return {
      id: examinerProfile.id,

      // User fields
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePhotoUrl: profilePhotoUrl,

      // Profile info
      professionalTitle: examinerProfile.professionalTitle || undefined,
      yearsOfIMEExperience: examinerProfile.yearsOfIMEExperience,
      clinicName: examinerProfile.clinicName || undefined,
      clinicAddress: examinerProfile.clinicAddress || undefined,
      bio: examinerProfile.bio || undefined,

      // Services & Assessment Types
      assessmentTypes: examinerProfile.assessmentTypes || [],
      assessmentTypeOther: examinerProfile.assessmentTypeOther || undefined,
      acceptVirtualAssessments: examinerProfile.acceptVirtualAssessments ?? undefined,
      acceptInPersonAssessments: examinerProfile.acceptInPersonAssessments ?? undefined,
      travelToClaimants: examinerProfile.travelToClaimants ?? undefined,
      maxTravelDistance: examinerProfile.maxTravelDistance || undefined,

      // Availability Preferences
      maxIMEsPerWeek: examinerProfile.maxIMEsPerWeek || undefined,
      minimumNoticeValue: examinerProfile.minimumNoticeValue || undefined,
      minimumNoticeUnit: examinerProfile.minimumNoticeUnit || undefined,
      weeklyAvailability,

      // Payout Details
      institutionNumber: examinerProfile.institutionNumber || undefined,
      transitNumber: examinerProfile.transitNumber || undefined,
      accountNumber: examinerProfile.accountNumber || undefined,

      // Documents
      medicalLicenseDocumentIds: examinerProfile.medicalLicenseDocumentIds || [],
      medicalLicenseUrls: medicalLicenseUrls || [],
      medicalLicenseNames: medicalLicenseNames || [],
      governmentIdDocumentId: examinerProfile.governmentIdDocumentId || undefined,
      governmentIdUrl: governmentIdUrl,
      governmentIdName: governmentIdName,
      resumeDocumentId: examinerProfile.resumeDocumentId || undefined,
      resumeUrl: resumeUrl,
      resumeName: resumeName,
      insuranceDocumentId: examinerProfile.insuranceDocumentId || undefined,
      insuranceUrl: insuranceUrl,
      insuranceName: insuranceName,
      specialtyCertificatesDocumentIds: examinerProfile.specialtyCertificatesDocumentIds || [],
      specialtyCertificatesUrls: specialtyCertificatesUrls || [],
      specialtyCertificatesNames: specialtyCertificatesNames || [],

      // Compliance
      phipaCompliance: examinerProfile.phipaCompliance || undefined,
      pipedaCompliance: examinerProfile.pipedaCompliance || undefined,
      medicalLicenseActive: examinerProfile.medicalLicenseActive || undefined,

      createdAt: examinerProfile.createdAt.toISOString(),
      updatedAt: examinerProfile.updatedAt.toISOString(),
    };
  }
}
