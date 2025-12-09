import ExaminerPageContent from "./ExaminerPageContent";
import { 
  listAllExaminers, 
  listAllApplications,
  listExaminerSpecialties, 
  listExaminerStatuses 
} from "@/domains/examiner/actions";
import { ExaminerData } from "@/domains/examiner/types/ExaminerData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Examiner | Thrive Admin",
  description: "Medical Examiner",
};

export const dynamic = "force-dynamic";

const Page = async () => {
  const [examiners, applications, specialties, statuses] = await Promise.all([
    listAllExaminers(),
    listAllApplications(),
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

  const applicationsData: ExaminerData[] = applications.map((application) => ({
    id: application.id,
    name: application.name,
    firstName: application.firstName,
    lastName: application.lastName,
    specialties: application.specialties,
    phone: application.phone,
    landlineNumber: application.landlineNumber,
    email: application.email,
    province: application.province,
    mailingAddress: application.mailingAddress,
    addressLookup: application.addressLookup,
    addressStreet: application.addressStreet,
    addressCity: application.addressCity,
    addressPostalCode: application.addressPostalCode,
    addressSuite: application.addressSuite,
    addressProvince: application.addressProvince,
    licenseNumber: application.licenseNumber,
    provinceOfLicensure: application.provinceOfLicensure,
    licenseExpiryDate: application.licenseExpiryDate,
    cvUrl: application.cvUrl,
    medicalLicenseUrl: application.medicalLicenseUrl,
    medicalLicenseUrls: application.medicalLicenseUrls,
    languagesSpoken: application.languagesSpoken,
    yearsOfIMEExperience: application.yearsOfIMEExperience,
    imesCompleted: application.imesCompleted,
    currentlyConductingIMEs: application.currentlyConductingIMEs,
    insurersOrClinics: application.insurersOrClinics,
    assessmentTypes: application.assessmentTypes,
    assessmentTypeOther: application.assessmentTypeOther,
    experienceDetails: application.experienceDetails,
    redactedIMEReportUrl: application.redactedIMEReportUrl,
    insuranceProofUrl: application.insuranceProofUrl,
    signedNdaUrl: application.signedNdaUrl,
    isForensicAssessmentTrained: application.isForensicAssessmentTrained,
    agreeToTerms: application.agreeToTerms,
    status: application.status,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    feeStructure: application.feeStructure,
  }));

  return (
    <ExaminerPageContent 
      examinersData={examinersData} 
      applicationsData={applicationsData}
      specialties={specialties} 
      statuses={statuses} 
    />
  );
};

export default Page;
