'use server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import {
  isSlugAvailable,
  deleteOrphanBySlugIfExists,
} from '@/domains/tenant/server/tenant.service';
import { enqueueProvisionJob } from '@/domains/tenant/server/enqueue-provision-job';
import { getFreePlanId } from '@/domains/plan/server/plan.service';

type CreateFreeTenantInput = {
  planId: string;
  tenantName: string;
  tenantSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  logoUrl?: string;
};

export async function createFreeTenantAction(
  input: CreateFreeTenantInput
): Promise<{ url?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Not authenticated' };

  const keycloakSub = session.user.keycloakSub;
  if (!keycloakSub) return { error: 'Missing SSO identity — please sign in via Keycloak' };

  const freePlanId = await getFreePlanId();
  if (!freePlanId || input.planId !== freePlanId) {
    return { error: 'Invalid plan. Free plan is required.' };
  }

  const { tenantName, tenantSlug, firstName, lastName, email, logoUrl } = input;

  if (!(await isSlugAvailable(tenantSlug))) {
    return { error: 'This subdomain is no longer available. Please choose another.' };
  }

  await deleteOrphanBySlugIfExists(tenantSlug);

  const tenant = await masterDb.tenant.create({
    data: {
      subdomain: tenantSlug,
      name: tenantName,
      status: 'DRAFT',
      databaseName: '',
      logoUrl: logoUrl ?? null,
      stripeCheckoutSessionId: null, // will set below after we have tenant.id
    },
  });

  const syntheticSessionId = `free-${tenant.id}`;

  await masterDb.tenantUser.create({
    data: {
      keycloakSub,
      tenantId: tenant.id,
      role: 'TENANT_ADMIN',
    },
  });

  await masterDb.subscription.create({
    data: {
      tenantId: tenant.id,
      stripePriceId: null,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      status: 'ACTIVE',
    },
  });

  await masterDb.tenant.update({
    where: { id: tenant.id },
    data: { stripeCheckoutSessionId: syntheticSessionId },
  });

  try {
    await enqueueProvisionJob({
      tenantId: tenant.id,
      stripeSessionId: syntheticSessionId,
      keycloakSub,
      tenantName,
      tenantSlug,
      logoUrl: logoUrl ?? null,
      stripePriceId: null,
      adminFirstName: firstName,
      adminLastName: lastName,
      adminEmail: email,
      stripeSubId: null,
      stripeCustomerId: null,
    });
  } catch (e) {
    await masterDb.tenant.delete({ where: { id: tenant.id } });
    return { error: 'Failed to start provisioning. Please try again.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return { url: `${appUrl}/portal/setup?session_id=${syntheticSessionId}&tenant_id=${tenant.id}` };
}
