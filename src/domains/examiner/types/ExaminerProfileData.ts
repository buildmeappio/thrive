// Type for Examiner Profile Detail (for ACTIVE examiners, not applications)
export type ExaminerProfileData = {
  id: string;

  // User fields
  firstName?: string;
  lastName?: string;
  email: string;
  profilePhotoUrl?: string;

  // Profile info
  professionalTitle?: string;
  yearsOfIMEExperience: string;
  clinicName?: string;
  clinicAddress?: string;
  bio?: string;

  // Services & Assessment Types
  assessmentTypes: string[];
  assessmentTypeOther?: string;
  acceptVirtualAssessments?: boolean;
  acceptInPersonAssessments?: boolean;
  travelToClaimants?: boolean;
  maxTravelDistance?: string;

  // Availability Preferences
  maxIMEsPerWeek?: string;
  minimumNoticeValue?: string;
  minimumNoticeUnit?: string;

  // Weekly availability
  weeklyAvailability?: WeeklyAvailability[];

  // Payout Details
  institutionNumber?: string;
  transitNumber?: string;
  accountNumber?: string;

  // Documents
  medicalLicenseDocumentIds: string[];
  medicalLicenseUrls?: string[];
  medicalLicenseNames?: string[];
  governmentIdDocumentId?: string;
  governmentIdUrl?: string;
  governmentIdName?: string;
  resumeDocumentId?: string;
  resumeUrl?: string;
  resumeName?: string;
  insuranceDocumentId?: string;
  insuranceUrl?: string;
  insuranceName?: string;
  specialtyCertificatesDocumentIds: string[];
  specialtyCertificatesUrls?: string[];
  specialtyCertificatesNames?: string[];

  // Compliance
  phipaCompliance?: boolean;
  pipedaCompliance?: boolean;
  medicalLicenseActive?: boolean;

  createdAt: string;
  updatedAt: string;
};

export type WeeklyAvailability = {
  id: string;
  dayOfWeek:
    | "SUNDAY"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY";
  enabled: boolean;
  timeSlots: TimeSlot[];
};

export type TimeSlot = {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
};
