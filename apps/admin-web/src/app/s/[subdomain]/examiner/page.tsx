import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import {
  listAllExaminers,
  listExaminerSpecialties,
  listExaminerStatuses,
} from '@/domains/examiner/actions';
import ExaminerPageContent from '@/domains/examiner/components/ExaminerPageContent';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';

export const metadata: Metadata = {
  title: 'Medical Examiner | Thrive Admin',
  description: 'Medical Examiner',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific examiner page.
 * Uses same examiner actions (tenant-aware via headers) and ExaminerPageContent as (private)/examiner.
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  const [examiners, specialties, statuses] = await Promise.all([
    listAllExaminers(),
    listExaminerSpecialties(),
    listExaminerStatuses(),
  ]);

  const examinersData: ExaminerData[] = examiners.map(examiner => ({
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
    approvedAt: examiner.approvedAt,
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
      wrapInShell={false}
    />
  );
};

export default Page;
