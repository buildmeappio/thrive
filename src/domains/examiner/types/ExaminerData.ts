export type ExaminerData = {
  id: string;
  name: string;
  specialties: string[];
  phone: string;
  landlineNumber?: string;
  email: string;
  province: string;
  mailingAddress: string;
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: string;
  cvUrl?: string;
  medicalLicenseUrl?: string;
  languagesSpoken: string[];
  yearsOfIMEExperience: string;
  experienceDetails: string;
  insuranceProofUrl?: string;
  signedNdaUrl?: string;
  status: ServerStatus;
  createdAt: string;
  updatedAt: string;
  feeStructure?: ExaminerFeeStructure;
};

export type ExaminerFeeStructure = {
  id: string;
  standardIMEFee: number;
  virtualIMEFee: number;
  recordReviewFee: number;
  hourlyRate?: number;
  reportTurnaroundDays?: number;
  cancellationFee: number;
  paymentTerms: string;
};

type ServerStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "INFO_REQUESTED";
  