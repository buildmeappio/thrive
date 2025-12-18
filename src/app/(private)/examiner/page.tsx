import ExaminerPageContent from "./ExaminerPageContent";
import {
  listAllExaminers,
  listExaminerSpecialties,
  listExaminerStatuses,
} from "@/domains/examiner/actions";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Examiner | Thrive Admin",
  description: "Medical Examiner",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [examiners, specialties, statuses] = await Promise.all([
    listAllExaminers(),
    listExaminerSpecialties(),
    listExaminerStatuses(),
  ]);

  const examinersData: ExaminerData[] = examiners.map((examiner) => ({
    id: examiner.id,
    name: examiner.name,
    firstName: examiner.firstName,
    lastName: examiner.lastName,
    specialties: examiner.specialties,
    phone: examiner.phone,
    landlineNumber: examiner.landlineNumber,
    email: examiner.email,
    province: examiner.province,
    mailingAddress: examiner.mailingAddress,
    addressLookup: examiner.addressLookup,
    addressStreet: examiner.addressStreet,
    addressCity: examiner.addressCity,
    addressPostalCode: examiner.addressPostalCode,
    addressSuite: examiner.addressSuite,
    addressProvince: examiner.addressProvince,
    licenseNumber: examiner.licenseNumber,
    provinceOfLicensure: examiner.provinceOfLicensure,
    licenseExpiryDate: examiner.licenseExpiryDate,
    cvUrl: examiner.cvUrl,
    medicalLicenseUrl: examiner.medicalLicenseUrl,
    medicalLicenseUrls: examiner.medicalLicenseUrls,
    languagesSpoken: examiner.languagesSpoken,
    yearsOfIMEExperience: examiner.yearsOfIMEExperience,
    imesCompleted: examiner.imesCompleted,
    currentlyConductingIMEs: examiner.currentlyConductingIMEs,
    insurersOrClinics: examiner.insurersOrClinics,
    assessmentTypes: examiner.assessmentTypes,
    assessmentTypeOther: examiner.assessmentTypeOther,
    experienceDetails: examiner.experienceDetails,
    redactedIMEReportUrl: examiner.redactedIMEReportUrl,
    insuranceProofUrl: examiner.insuranceProofUrl,
    signedNdaUrl: examiner.signedNdaUrl,
    isForensicAssessmentTrained: examiner.isForensicAssessmentTrained,
    agreeToTerms: examiner.agreeToTerms,
    status: examiner.status,
    createdAt: examiner.createdAt,
    updatedAt: examiner.updatedAt,
    feeStructure: examiner.feeStructure,
  }));

  return (
    <ExaminerPageContent
      examinersData={examinersData}
      specialties={specialties}
      statuses={statuses}
    />
  );
};

export default Page;
