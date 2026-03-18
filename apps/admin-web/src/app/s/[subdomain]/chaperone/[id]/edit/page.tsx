import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getChaperoneById, updateChaperone } from '@/domains/services/actions';
import EditChaperoneClient from '@/app/(private)/dashboard/chaperones/[id]/edit/EditChaperoneClient';

export const metadata: Metadata = {
  title: 'Edit Chaperone | Thrive Admin',
  description: 'Edit chaperone details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant chaperone edit page. Uses same EditChaperoneClient; tenant DB is resolved via getTenantDbFromHeaders in the actions.
 */
export default async function TenantChaperoneEditPage({ params }: Props) {
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
    <EditChaperoneClient
      chaperone={response.result}
      basePath="/chaperone"
      onUpdate={updateChaperone}
    />
  );
}
