import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantApplicationService } from '@/domains/tenant-dashboard/server/application.service';
import TenantApplicationPageContent from '@/domains/tenant-dashboard/components/application/ApplicationPageContent';
import { ExaminerData } from '@/domains/examiner/types/ExaminerData';
import { ApplicationDto } from '@/domains/examiner/server/dto/application.dto';

export const metadata: Metadata = {
  title: 'Examiner Applications | Thrive Admin',
  description: 'Examiner Applications',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific application page
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

  // Create tenant application service
  const applicationService = createTenantApplicationService(tenantDb);

  // Fetch application data
  const [applications, specialties, statuses] = await Promise.all([
    applicationService.getApplications(),
    applicationService.getExaminerSpecialties(),
    applicationService.getExaminerStatuses(),
  ]);

  // Transform to ExaminerData format using ApplicationDto
  const applicationsData: ExaminerData[] = ApplicationDto.toApplicationDataList(applications);

  return (
    <TenantApplicationPageContent
      applicationsData={applicationsData}
      specialties={specialties}
      statuses={statuses}
    />
  );
};

export default Page;
