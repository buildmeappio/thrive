import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantCaseService } from '@/domains/tenant-case/server/case.service';
import CasePageContent from '@/domains/tenant-case/components/CasePageContent';

export const metadata: Metadata = {
  title: 'Cases | Thrive Admin',
  description: 'Cases',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific cases page
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

  // Create tenant case service
  const caseService = createTenantCaseService(tenantDb);

  // Fetch case data
  const [cases, types, statuses, priorityLevels] = await Promise.all([
    caseService.getCases(),
    caseService.getCaseTypes(),
    caseService.getCaseStatuses(),
    caseService.getPriorityLevels(),
  ]);

  return (
    <CasePageContent
      data={cases}
      types={types}
      statuses={statuses}
      priorityLevels={priorityLevels}
    />
  );
};

export default Page;
