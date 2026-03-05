import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantTaxonomyService } from '@/domains/tenant-taxonomy/server/taxonomy.service';
import TaxonomyPageContent from '@/domains/tenant-taxonomy/components/TaxonomyPageContent';
import { TaxonomyType } from '@/domains/tenant-taxonomy/types/TaxonomyData';

export const metadata: Metadata = {
  title: 'Taxonomies | Thrive Admin',
  description: 'Taxonomies',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ type?: string }>;
};

/**
 * Tenant-specific taxonomies page
 */
const Page = async ({ params, searchParams }: Props) => {
  const { subdomain } = await params;
  const { type } = await searchParams;

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

  // Create tenant taxonomy service
  const taxonomyService = createTenantTaxonomyService(tenantDb);

  // Default to caseType if no type specified
  const taxonomyType = (type as TaxonomyType) || 'caseType';

  // Fetch taxonomy data
  const data = await taxonomyService.getTaxonomies(taxonomyType);

  return <TaxonomyPageContent type={taxonomyType} data={data} />;
};

export default Page;
