import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantOrganizationDetails } from '@/domains/tenant-dashboard/actions/organization.actions';
import TenantOrganizationDetail from '@/domains/tenant-dashboard/components/organization/OrganizationDetail';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Organization Details | Thrive Admin',
  description: 'Organization details',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string; id: string }>;
};

/**
 * Tenant-specific organization detail page
 */
const Page = async ({ params }: Props) => {
  const { subdomain, id } = await params;

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

  // Get organization details
  const result = await getTenantOrganizationDetails(id);

  if (!result.success || !result.organization) {
    notFound();
  }

  return <TenantOrganizationDetail organization={result.organization} />;
};

export default Page;
