import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantExaminerProfileById } from '@/domains/tenant-dashboard/actions/examiner.actions';
import TenantExaminerProfileDetail from '@/domains/tenant-dashboard/components/examiner/ExaminerProfileDetail';

export const metadata: Metadata = {
  title: 'Examiner Profile | Thrive Admin',
  description: 'Examiner profile details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant-specific examiner profile detail page
 */
const Page = async ({ params }: Props) => {
  const { subdomain, id } = await params;

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

  // Get examiner profile details
  const result = await getTenantExaminerProfileById(id);

  if (!result.success || !result.profile) {
    notFound();
  }

  return <TenantExaminerProfileDetail profile={result.profile} />;
};

export default Page;
