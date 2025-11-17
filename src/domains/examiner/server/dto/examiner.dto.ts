import { ExaminerProfile, Account, User, Documents, ExaminerLanguage, Language, ExaminerFeeStructure } from "@prisma/client";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

type ExaminerWithRelations = ExaminerProfile & {
  account: Account & {
    user: User;
  };
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
      specialties: examiner.specialties || [],
      phone: examiner.account.user.phone || "",
      landlineNumber: examiner.landlineNumber || undefined,
      email: examiner.account.user.email,
      province: examiner.provinceOfResidence || "",
      mailingAddress: examiner.mailingAddress || "",
      licenseNumber: examiner.licenseNumber || "",
      provinceOfLicensure: examiner.provinceOfLicensure || "",
      licenseExpiryDate: examiner.licenseExpiryDate?.toISOString() || "",
      cvUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrl: undefined, // Will be set by handler with presigned URL
      languagesSpoken: examiner.examinerLanguages?.map((el) => el.language.name) || [],
      yearsOfIMEExperience: String(examiner.yearsOfIMEExperience || "0"),
      experienceDetails: examiner.bio || "",
      insuranceProofUrl: undefined, // Will be set by handler with presigned URL
      signedNdaUrl: undefined, // Will be set by handler with presigned URL
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

