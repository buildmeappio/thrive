export type ExaminerData = {
  id: string;
  name: string;
  specialties: string[];
  phone: string;
  email: string;
  province: string;
  mailingAddress: string;
  licenseNumber: string;
  provinceOfLicensure: string;
  licenseExpiryDate: string;
  cvUrl?: string;
  medicalLicenseUrl?: string;
  languagesSpoken: string[];
  yearsOfIMEExperience: number;
  experienceDetails: string;
  insuranceProofUrl?: string;
  signedNdaUrl?: string;
  status: ServerStatus;
  createdAt: string;
  updatedAt: string;
};

type ServerStatus = "PENDING" | "ACCEPTED" | "REJECTED";
  