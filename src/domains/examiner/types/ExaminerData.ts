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
  experienceDetails: string;
  insuranceProofUrl?: string;
  signedNdaUrl?: string;
  isForensicAssessmentTrained?: boolean;
  agreeToTerms?: boolean;
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

type ServerStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "INFO_REQUESTED" | "ACTIVE";
  