import { ExaminerProfile, Account, User, Documents, ExaminerLanguage, Language } from "@prisma/client";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

type ExaminerWithRelations = ExaminerProfile & {
  account: Account & {
    user: User;
  };
  medicalLicenseDocument: Documents;
  resumeDocument: Documents;
  ndaDocument: Documents;
  insuranceDocument: Documents;
  examinerLanguages: Array<ExaminerLanguage & { language: Language }>;
};

export class ExaminerDto {
  static toExaminerData(examiner: ExaminerWithRelations): ExaminerData {
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
    };
  }

  static toExaminerDataList(examiners: ExaminerWithRelations[]): ExaminerData[] {
    return examiners.map((e) => this.toExaminerData(e));
  }
}

