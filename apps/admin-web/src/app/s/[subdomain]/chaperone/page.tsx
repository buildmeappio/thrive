import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantChaperoneService } from '@/domains/tenant-chaperone/server/chaperone.service';
import ChaperonePageContent from '@/domains/tenant-chaperone/components/ChaperonePageContent';

export const metadata: Metadata = {
  title: 'Chaperones | Thrive Admin',
  description: 'Chaperones',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific chaperones page
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

  // Create tenant chaperone service
  const chaperoneService = createTenantChaperoneService(tenantDb);

  // Fetch chaperone data
  const chaperones = await chaperoneService.getChaperones();

  return <ChaperonePageContent chaperones={chaperones} />;
};

export default Page;
