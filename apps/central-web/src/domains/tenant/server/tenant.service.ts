import 'server-only';
import masterDb from '@thrive/database-master/db';

export type SetupStatus =
  | 'PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'CREATING_YOUR_WORKSPACE'
  | 'SETTING_UP_YOUR_ACCOUNT'
  | 'COMPLETED'
  | 'ERROR';

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await masterDb.tenant.findFirst({
    where: { subdomain: slug },
    include: { subscription: { select: { id: true } } },
  });
  if (existing === null) return true;
  // Orphan: DRAFT tenant with no completed payment (no subscription) — slug is available for reuse
  if (existing.status === 'DRAFT' && !existing.subscription) return true;
  return false;
}

/**
 * Delete orphan DRAFT tenant (abandoned checkout) so the slug can be reused.
 * Call before creating tenant when slug was "available" due to an orphan.
 */
export async function deleteOrphanBySlugIfExists(slug: string): Promise<void> {
  const tenant = await masterDb.tenant.findFirst({
    where: { subdomain: slug },
    include: { subscription: true },
  });
  if (tenant?.status === 'DRAFT' && !tenant.subscription) {
    await masterDb.tenant.delete({ where: { id: tenant.id } });
  }
}

export async function getTenantsByKeycloakSub(keycloakSub: string) {
  return masterDb.tenantUser.findMany({
    where: { keycloakSub },
    include: {
      tenant: {
        include: { subscription: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTenantSetupStatus(sessionId: string): Promise<{
  setupStatus: SetupStatus;
  tenantSlug: string | null;
  errorMessage: string | null;
}> {
  const tenant = await masterDb.tenant.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { subscription: true },
  });

  if (!tenant) {
    return { setupStatus: 'PENDING', tenantSlug: null, errorMessage: null };
  }

  if (tenant.provisionErrorMessage) {
    return {
      setupStatus: 'ERROR',
      tenantSlug: tenant.subdomain,
      errorMessage: tenant.provisionErrorMessage,
    };
  }

  if (tenant.status === 'ACTIVE') {
    return {
      setupStatus: 'COMPLETED',
      tenantSlug: tenant.subdomain,
      errorMessage: null,
    };
  }

  if (!tenant.subscription || tenant.subscription.status !== 'ACTIVE') {
    return { setupStatus: 'PENDING', tenantSlug: tenant.subdomain, errorMessage: null };
  }

  switch (tenant.provisionStep) {
    case 'CREATING_DB':
    case 'RUNNING_MIGRATIONS':
      return {
        setupStatus: 'CREATING_YOUR_WORKSPACE',
        tenantSlug: tenant.subdomain,
        errorMessage: null,
      };
    case 'CREATING_ADMIN':
      return {
        setupStatus: 'SETTING_UP_YOUR_ACCOUNT',
        tenantSlug: tenant.subdomain,
        errorMessage: null,
      };
    case 'DONE':
      return {
        setupStatus: 'COMPLETED',
        tenantSlug: tenant.subdomain,
        errorMessage: null,
      };
    default:
      return {
        setupStatus: 'PAYMENT_CONFIRMED',
        tenantSlug: tenant.subdomain,
        errorMessage: null,
      };
  }
}
