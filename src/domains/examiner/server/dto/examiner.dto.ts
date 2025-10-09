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
    const s3BaseUrl = "https://public-thrive-assets.s3.eu-north-1.amazonaws.com";
    
    return {
      id: examiner.id,
      name: `${examiner.account.user.firstName} ${examiner.account.user.lastName}`.trim(),
      specialties: examiner.specialties || [],
      phone: examiner.account.user.phone || "",
      email: examiner.account.user.email,
      province: examiner.provinceOfResidence || "",
      mailingAddress: examiner.mailingAddress || "",
      licenseNumber: examiner.licenseNumber || "",
      provinceOfLicensure: examiner.provinceOfLicensure || "",
      licenseExpiryDate: examiner.licenseExpiryDate?.toISOString() || "",
      cvUrl: examiner.resumeDocument ? `${s3BaseUrl}/documents/${examiner.resumeDocument.name}` : undefined,
      medicalLicenseUrl: examiner.medicalLicenseDocument ? `${s3BaseUrl}/documents/${examiner.medicalLicenseDocument.name}` : undefined,
      languagesSpoken: examiner.examinerLanguages?.map((el) => el.language.name) || [],
      yearsOfIMEExperience: String(examiner.yearsOfIMEExperience || "0"),
      experienceDetails: examiner.bio || "",
      insuranceProofUrl: examiner.insuranceDocument ? `${s3BaseUrl}/documents/${examiner.insuranceDocument.name}` : undefined,
      signedNdaUrl: examiner.ndaDocument ? `${s3BaseUrl}/documents/${examiner.ndaDocument.name}` : undefined,
      status: examiner.status,
      createdAt: examiner.createdAt.toISOString(),
      updatedAt: examiner.updatedAt.toISOString(),
    };
  }

  static toExaminerDataList(examiners: ExaminerWithRelations[]): ExaminerData[] {
    return examiners.map((e) => this.toExaminerData(e));
  }
}

