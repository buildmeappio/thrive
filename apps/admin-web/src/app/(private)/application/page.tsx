import ApplicationsPageContent from './ApplicationsPageContent';
import {
  listAllApplications,
  listExaminerSpecialties,
  listExaminerStatuses,
} from '@/domains/examiner/actions';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Examiner Applications | Thrive Admin',
  description: 'Examiner Applications',
};

export const dynamic = 'force-dynamic';

const Page = async () => {
  const [applications, specialties, statuses] = await Promise.all([
    listAllApplications(),
    listExaminerSpecialties(),
    listExaminerStatuses(),
  ]);

  const applicationsData: ExaminerData[] = applications.map(application => ({
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
    <ApplicationsPageContent
      applicationsData={applicationsData}
      specialties={specialties}
      statuses={statuses}
    />
  );
};

export default Page;
