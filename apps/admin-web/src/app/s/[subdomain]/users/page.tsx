import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantUserService } from '@/domains/tenant-user/server/user.service';
import UserPageContent from '@/domains/tenant-user/components/UserPageContent';

export const metadata: Metadata = {
  title: 'Users | Thrive Admin',
  description: 'Users',
};

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ subdomain: string }>;
};

/**
 * Tenant-specific users page
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

  // Create tenant user service
  const userService = createTenantUserService(tenantDb);

  // Fetch user data and resolve current user id from Keycloak sub
  const [users, currentUserId] = await Promise.all([
    userService.getUsers(),
    userService.getUserIdByKeycloakSub(tenantSession.keycloakSub),
  ]);

  return <UserPageContent users={users} currentUserId={currentUserId ?? undefined} />;
};

export default Page;
