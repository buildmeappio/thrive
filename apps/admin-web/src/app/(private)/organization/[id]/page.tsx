import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import OrganizationDetail from '@/domains/organization/components/OrganizationDetail';
import { notFound } from 'next/navigation';
import organizationActions from '@/domains/organization/actions';

/**
 * Extract subdomain from request headers
 */
async function extractSubdomainFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'auth') {
    return parts[0];
  }
  return null;
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  // Extract subdomain from headers
  const subdomain = await extractSubdomainFromHeaders();
  if (!subdomain) {
    redirect('/access-denied');
  }

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

  const { id } = await params;
  const org = await organizationActions.getOrganizationDetails(id);
  if (!org) return notFound();
  return <OrganizationDetail organization={org} />;
};

export default Page;
