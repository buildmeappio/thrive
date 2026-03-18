import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantApplicationService } from '@/domains/tenant-dashboard/server/application.service';
import { ApplicationDto } from '@/domains/examiner/server/dto/application.dto';
import ExaminerDetail from '@/domains/examiner/components/ExaminerDetail';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant application detail page – uses same ExaminerDetail as private application detail.
 */
export default async function TenantApplicationDetailPage({ params }: Props) {
  const { subdomain, id } = await params;

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

  const tenantDb = await getTenantDb(tenant.id);
  const applicationService = createTenantApplicationService(tenantDb);
  const application = await applicationService.getApplicationById(id);

  if (!application || application.status === 'DRAFT') {
    return notFound();
  }

  const applicationData = ApplicationDto.toApplicationData(application);
  (applicationData as { hasExaminerProfile?: boolean }).hasExaminerProfile =
    !!application.examinerProfile;

  const basePath = `/s/${subdomain}/application`;

  return (
    <ExaminerDetail
      examiner={{ ...applicationData, status: application.status }}
      isApplication={true}
      basePath={basePath}
    />
  );
}
