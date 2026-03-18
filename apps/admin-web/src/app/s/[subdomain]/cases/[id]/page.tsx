import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantCaseService } from '@/domains/tenant-case/server/case.service';
import CaseDetailPageClient from '@/app/(private)/cases/[id]/CaseDetailPageClient';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant case detail page – uses same CaseDetailPageClient as private case detail.
 */
export default async function TenantCaseDetailPage({ params }: Props) {
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
  const caseService = createTenantCaseService(tenantDb);

  let caseDetails;
  try {
    caseDetails = await caseService.getCaseDetails(id);
  } catch {
    return notFound();
  }

  const basePath = `/s/${subdomain}/cases`;

  return <CaseDetailPageClient caseDetails={caseDetails} basePath={basePath} />;
}
