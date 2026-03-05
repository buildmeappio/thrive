import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import SupportPageContent from '@/domains/tenant-support/components/SupportPageContent';

export const metadata: Metadata = {
  title: 'Support | Thrive Admin',
  description: 'Support',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific support page
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

  return <SupportPageContent />;
};

export default Page;
