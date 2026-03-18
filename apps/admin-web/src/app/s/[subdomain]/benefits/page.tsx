import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantBenefitService } from '@/domains/tenant-benefit/server/benefit.service';
import { deleteTenantBenefit } from '@/domains/tenant-benefit/actions/benefit.actions';
import BenefitPageContent from '@/domains/tenant-benefit/components/BenefitPageContent';

export const metadata: Metadata = {
  title: 'Benefits | Thrive Admin',
  description: 'Benefits',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific benefits page
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

  // Create tenant benefit service
  const benefitService = createTenantBenefitService(tenantDb);

  // Fetch benefit data
  const benefits = await benefitService.getBenefits();

  return (
    <BenefitPageContent benefits={benefits} basePath="/benefits" onDelete={deleteTenantBenefit} />
  );
};

export default Page;
