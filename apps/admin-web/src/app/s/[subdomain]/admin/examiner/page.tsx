import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantExaminerService } from '@/domains/tenant-dashboard/server/examiner.service';
import TenantExaminerPageContent from '@/domains/tenant-dashboard/components/examiner/ExaminerPageContent';
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
 * Tenant-specific examiner page
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Get tenant session from cookies
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Get tenant database connection
  const tenantDb = await getTenantDb(tenant.id);

  // Create tenant examiner service
  const examinerService = createTenantExaminerService(tenantDb);

  // Fetch examiner data
  const [examiners, specialties, statuses] = await Promise.all([
    examinerService.getExaminers(),
    examinerService.getExaminerSpecialties(),
    examinerService.getExaminerStatuses(),
  ]);

  // Transform to ExaminerData format (simplified - full implementation needed)
  const examinersData: ExaminerData[] = examiners.map(examiner => ({
    id: examiner.id,
    name: `${examiner.account.user.firstName} ${examiner.account.user.lastName}`,
    firstName: examiner.account.user.firstName,
    lastName: examiner.account.user.lastName,
    specialties: [], // TODO: Map from examiner profile
    phone: '', // TODO: Map from examiner profile
    email: examiner.account.user.email,
    province: '', // TODO: Map from examiner profile
    mailingAddress: '', // TODO: Map from examiner profile
    licenseNumber: '', // TODO: Map from examiner profile
    provinceOfLicensure: '', // TODO: Map from examiner profile
    licenseExpiryDate: '', // TODO: Map from examiner profile
    languagesSpoken: [], // TODO: Map from examiner profile
    yearsOfIMEExperience: '', // TODO: Map from examiner profile
    experienceDetails: '', // TODO: Map from examiner profile
    status: examiner.account.status as ExaminerData['status'],
    createdAt: examiner.createdAt.toISOString(),
    updatedAt: examiner.updatedAt.toISOString(),
  }));

  return (
    <TenantExaminerPageContent
      examinersData={examinersData}
      specialties={specialties}
      statuses={statuses}
    />
  );
};

export default Page;
