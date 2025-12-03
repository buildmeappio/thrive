import { ExaminerProfile, Account, User, Documents, ExaminerLanguage, Language, ExaminerFeeStructure, Address } from "@prisma/client";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

type ExaminerWithRelations = ExaminerProfile & {
  account: Account & {
    user: User;
  };
  address: Address | null;
  medicalLicenseDocument: Documents | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
  feeStructure: ExaminerFeeStructure[];
  contracts?: Array<any>; // Optional contracts relation
};

export class ExaminerDto {
  static toExaminerData(examiner: ExaminerWithRelations): ExaminerData {
    const feeStructure = examiner.feeStructure?.[0];
    
    return {
      id: examiner.id,
      name: `${examiner.account.user.firstName} ${examiner.account.user.lastName}`.trim(),
      firstName: examiner.account.user.firstName || undefined,
      lastName: examiner.account.user.lastName || undefined,
      specialties: examiner.specialties || [],
      phone: examiner.account.user.phone || "",
      landlineNumber: examiner.landlineNumber || undefined,
      email: examiner.account.user.email,
      province: examiner.provinceOfResidence || "",
      mailingAddress: examiner.mailingAddress || "",
      addressLookup: examiner.address?.address || undefined,
      addressStreet: examiner.address?.street || undefined,
      addressCity: examiner.address?.city || undefined,
      addressPostalCode: examiner.address?.postalCode || undefined,
      addressSuite: examiner.address?.suite || undefined,
      addressProvince: examiner.address?.province || undefined,
      licenseNumber: examiner.licenseNumber || "",
      provinceOfLicensure: examiner.provinceOfLicensure || "",
      licenseExpiryDate: examiner.licenseExpiryDate?.toISOString() || "",
      cvUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrls: undefined, // Will be set by handler with presigned URLs (for multiple licenses)
      languagesSpoken: examiner.examinerLanguages?.map((el) => el.language.name) || [],
      yearsOfIMEExperience: String(examiner.yearsOfIMEExperience || "0"),
      experienceDetails: examiner.bio || "",
      insuranceProofUrl: undefined, // Will be set by handler with presigned URL
      signedNdaUrl: undefined, // Will be set by handler with presigned URL
      isForensicAssessmentTrained: examiner.isForensicAssessmentTrained || false,
      agreeToTerms: examiner.agreeToTerms || false,
      status: examiner.status,
      createdAt: examiner.createdAt.toISOString(),
      updatedAt: examiner.updatedAt.toISOString(),
      feeStructure: feeStructure ? {
        id: feeStructure.id,
        IMEFee: Number(feeStructure.IMEFee),
        recordReviewFee: Number(feeStructure.recordReviewFee),
        hourlyRate: feeStructure.hourlyRate ? Number(feeStructure.hourlyRate) : undefined,
        cancellationFee: Number(feeStructure.cancellationFee),
        paymentTerms: feeStructure.paymentTerms,
      } : undefined,
    };
  }

  static toExaminerDataList(examiners: ExaminerWithRelations[]): ExaminerData[] {
    return examiners.map((e) => this.toExaminerData(e));
  }
}

