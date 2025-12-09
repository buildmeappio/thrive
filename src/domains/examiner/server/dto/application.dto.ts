import { ExaminerApplication, Address, Documents } from "@prisma/client";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";

type ApplicationWithRelations = ExaminerApplication & {
  address: Address | null;
  resumeDocument: Documents | null;
  ndaDocument: Documents | null;
  insuranceDocument: Documents | null;
  redactedIMEReportDocument: Documents | null;
};

export class ApplicationDto {
  static toApplicationData(application: ApplicationWithRelations): ExaminerData {
    return {
      id: application.id,
      name: `${application.firstName || ""} ${application.lastName || ""}`.trim(),
      firstName: application.firstName || undefined,
      lastName: application.lastName || undefined,
      specialties: application.specialties || [],
      phone: application.phone || "",
      landlineNumber: application.landlineNumber || undefined,
      email: application.email,
      province: application.provinceOfResidence || "",
      mailingAddress: application.mailingAddress || "",
      addressLookup: application.address?.address || undefined,
      addressStreet: application.address?.street || undefined,
      addressCity: application.address?.city || undefined,
      addressPostalCode: application.address?.postalCode || undefined,
      addressSuite: application.address?.suite || undefined,
      addressProvince: application.address?.province || undefined,
      licenseNumber: application.licenseNumber || "",
      provinceOfLicensure: application.provinceOfLicensure || "",
      licenseExpiryDate: application.licenseExpiryDate?.toISOString() || "",
      cvUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrl: undefined, // Will be set by handler with presigned URL
      medicalLicenseUrls: undefined, // Will be set by handler with presigned URLs
      languagesSpoken: application.languagesSpoken || [],
      yearsOfIMEExperience: String(application.yearsOfIMEExperience || "0"),
      imesCompleted: application.imesCompleted || undefined,
      currentlyConductingIMEs: application.currentlyConductingIMEs || false,
      insurersOrClinics: application.insurersOrClinics || undefined,
      assessmentTypes: application.assessmentTypeIds || [],
      assessmentTypeOther: application.assessmentTypeOther || undefined,
      experienceDetails: application.experienceDetails || "",
      redactedIMEReportUrl: undefined, // Will be set by handler with presigned URL
      insuranceProofUrl: undefined, // Will be set by handler with presigned URL
      signedNdaUrl: undefined, // Will be set by handler with presigned URL
      isForensicAssessmentTrained: application.isForensicAssessmentTrained ?? false,
      agreeToTerms: application.agreeToTerms ?? false,
      contractSignedByExaminerAt: application.contractSignedByExaminerAt?.toISOString() || undefined,
      contractConfirmedByAdminAt: application.contractConfirmedByAdminAt?.toISOString() || undefined,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      feeStructure: application.IMEFee !== null && application.recordReviewFee !== null && application.cancellationFee !== null && application.paymentTerms !== null
        ? {
            id: application.id, // Use application ID as temporary ID
            IMEFee: Number(application.IMEFee),
            recordReviewFee: Number(application.recordReviewFee),
            hourlyRate: application.hourlyRate ? Number(application.hourlyRate) : undefined,
            cancellationFee: Number(application.cancellationFee),
            paymentTerms: application.paymentTerms,
          }
        : undefined,
    };
  }

  static toApplicationDataList(applications: ApplicationWithRelations[]): ExaminerData[] {
    return applications.map((a) => this.toApplicationData(a));
  }
}

