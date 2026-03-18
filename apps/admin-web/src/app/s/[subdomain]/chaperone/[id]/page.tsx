import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getChaperoneById, deleteChaperone } from '@/domains/services/actions';
import ChaperoneDetailsClient from '@/app/(private)/dashboard/chaperones/[id]/ChaperoneDetailsClient';

export const metadata: Metadata = {
  title: 'Chaperone | Thrive Admin',
  description: 'Chaperone details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant chaperone detail page. Uses same ChaperoneDetailsClient; tenant DB is resolved via getTenantDbFromHeaders in the actions.
 */
export default async function TenantChaperoneDetailPage({ params }: Props) {
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

  const response = await getChaperoneById(id);

  if (!response.success || !response.result) {
    notFound();
  }

  return (
    <ChaperoneDetailsClient
      chaperone={response.result}
      basePath="/chaperone"
      onDelete={deleteChaperone}
    />
  );
}
