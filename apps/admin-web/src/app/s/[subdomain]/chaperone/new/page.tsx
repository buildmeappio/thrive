import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import NewChaperoneClient from '@/app/(private)/dashboard/chaperones/new/NewChaperoneClient';

export const metadata: Metadata = {
  title: 'Add New Chaperone | Thrive Admin',
  description: 'Add a new chaperone',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

export default async function TenantNewChaperonePage({ params }: Props) {
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

  return <NewChaperoneClient basePath="/chaperone" />;
}
