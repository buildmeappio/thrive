import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantTransporterService } from '@/domains/tenant-transporter/server/transporter.service';
import TransporterPageContent from '@/domains/tenant-transporter/components/TransporterPageContent';

export const metadata: Metadata = {
  title: 'Transporters | Thrive Admin',
  description: 'Transporters',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific transporters page
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

  // Create tenant transporter service
  const transporterService = createTenantTransporterService(tenantDb);

  // Fetch transporter data
  const result = await transporterService.getTransporters(1, 20, '');

  const statuses = ['ACTIVE', 'SUSPENDED'];

  return <TransporterPageContent data={result.data} statuses={statuses} />;
};

export default Page;
