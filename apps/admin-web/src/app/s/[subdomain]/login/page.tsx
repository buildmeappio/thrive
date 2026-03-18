import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantInfo } from '@/domains/tenant-dashboard/actions/tenant.actions';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import TenantLoginPage from '@/domains/tenant-dashboard/components/TenantLoginPage';

export const metadata: Metadata = {
  title: 'Login | Thrive Admin',
  description: 'Login to your tenant admin dashboard',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific login page
 * Shows tenant branding (logo and name) and Keycloak login button
 */
const Page = async ({ params }: Props) => {
  const { subdomain } = await params;

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
    select: {
      id: true,
      name: true,
      subdomain: true,
    },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Check if user is already logged in
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (tenantSession) {
    redirect('/dashboard-new');
  }

  // Get tenant info (with logo URL)
  const tenantInfo = await getTenantInfo(subdomain);

  return <TenantLoginPage tenantInfo={tenantInfo} subdomain={subdomain} />;
};

export default Page;
