export type ExaminerData = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialties: string[];
  phone: string;
  landlineNumber?: string;
  email: string;
  province: string;
  mailingAddress: string;
  addressLookup?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressSuite?: string;
  addressProvince?: string;
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: string;
  cvUrl?: string;
  medicalLicenseUrl?: string;
  medicalLicenseUrls?: string[]; // Support multiple medical licenses
  languagesSpoken: string[];
  yearsOfIMEExperience: string;
  imesCompleted?: string; // How many IMEs completed (0-10, 11-25, 26-50, 51+)
  currentlyConductingIMEs?: boolean; // Currently conducting IMEs
  insurersOrClinics?: string; // Which insurers or clinics (textarea)
  assessmentTypes?: string[]; // Assessment types (multi-select)
  assessmentTypeOther?: string; // Other assessment type specification
  experienceDetails: string; // Tell us about your experience
  redactedIMEReportUrl?: string; // Redacted IME Report document
  insuranceProofUrl?: string;
  signedNdaUrl?: string;
  isForensicAssessmentTrained?: boolean;
  agreeToTerms?: boolean;
  contractSignedByExaminerAt?: string;
  contractConfirmedByAdminAt?: string;
  status: ServerStatus;
  createdAt: string;
  updatedAt: string;
  feeStructure?: ExaminerFeeStructure;
};

export type ExaminerFeeStructure = {
  id: string;
  IMEFee: number;
  recordReviewFee: number;
  hourlyRate?: number;
  cancellationFee: number;
  paymentTerms: string;
};

type ServerStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "INFO_REQUESTED" | "ACTIVE" | "SUBMITTED" | "IN_REVIEW" | "MORE_INFO_REQUESTED" | "INTERVIEW_SCHEDULED" | "INTERVIEW_COMPLETED" | "CONTRACT_SENT" | "CONTRACT_SIGNED" | "APPROVED" | "WITHDRAWN";
  