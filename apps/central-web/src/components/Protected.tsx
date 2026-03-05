import { auth } from '@/domains/auth/server/better-auth/auth';
import { getTenantsByKeycloakSub } from '@/domains/tenant/server/tenant.service';
import { Subscription, Tenant } from '@thrive/database-master';
import { Session, User } from 'better-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type ProtectedProps<T extends Promise<Record<string, any>>> = {
  params: T;
  session: Session;
  user: User;
  availableTenants: Array<Tenant & { subscription: Subscription }>;
};

const withProtected = <Params extends Promise<Record<string, any>>>(
  Component: React.ComponentType<ProtectedProps<Params>>
) => {
  const Protected = async (
    props: Omit<ProtectedProps<Params>, 'session' | 'user'> & { params: Awaited<Params> }
  ) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !session.user.keycloakSub) redirect('/login');

    const tenantUsers = await getTenantsByKeycloakSub(session.user.keycloakSub);

    // Allow access even if no tenants (for empty state on tenants page)
    // Pass empty array if no tenants exist
    return (
      <Component
        {...props}
        session={session.session}
        user={session.user}
        availableTenants={tenantUsers.map(tenantUser => tenantUser.tenant)}
      />
    );
  };

  Protected.displayName = `WithProtected(${Component.displayName || Component.name || 'Component'})`;

  return Protected;
};

export default withProtected;
