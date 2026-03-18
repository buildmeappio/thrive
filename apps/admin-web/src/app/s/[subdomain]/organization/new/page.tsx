// import { Metadata } from 'next';
// import { redirect } from 'next/navigation';
// import masterDb from '@thrive/database-master/db';
// import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
// import TenantCreateOrganizationForm from '@/domains/tenant-dashboard/components/organization/CreateOrganizationForm';

// export const metadata: Metadata = {
//   title: 'Create Organization | Thrive Admin',
//   description: 'Create a new organization',
// };

// export const dynamic = 'force-dynamic';

// type Props = {
//   params: Promise<{ subdomain: string }>;
// };

// /**
//  * Tenant-specific create organization page
//  */
// const Page = async ({ params }: Props) => {
//   const { subdomain } = await params;

//   // Get tenant from master DB
//   const tenant = await masterDb.tenant.findUnique({
//     where: { subdomain },
//   });

//   if (!tenant) {
//     redirect('/access-denied');
//   }

//   // Get tenant session from cookies
//   const tenantSession = await getTenantSessionFromCookies(tenant.id);
//   if (!tenantSession) {
//     redirect('/access-denied');
//   }

//   return <TenantCreateOrganizationForm />;
// };

// export default Page;
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import organizationActions from '@/domains/organization/actions';
import CreateOrganizationForm from '@/domains/organization/components/CreateOrganizationForm';

export const metadata: Metadata = {
  title: 'Create Organization | Thrive Admin',
  description: 'Create a new organization',
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

  return (
    <CreateOrganizationForm
      wrapInShell={false}
      createOrganizationAction={organizationActions.createOrganization}
    />
  );
};

export default Page;
