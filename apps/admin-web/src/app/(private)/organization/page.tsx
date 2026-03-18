import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import organizationActions from '@/domains/organization/actions';
import OrganizationPageContent from './OrganizationPageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organization | Thrive Admin',
  description: 'Organization',
};

export const dynamic = 'force-dynamic';

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

const Page = async () => {
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

  const [orgs, types] = await Promise.all([
    organizationActions.getOrganizations(),
    organizationActions.getOrganizationTypes(),
  ]);

  const typeNames = types.map(t => t.name);

  return <OrganizationPageContent data={orgs} types={typeNames} />;
};

export default Page;
