'use server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { stripe } from '@/domains/stripe/server/stripe.client';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import {
  isSlugAvailable,
  deleteOrphanBySlugIfExists,
} from '@/domains/tenant/server/tenant.service';

type CreateCheckoutInput = {
  priceId: string;
  tenantName: string;
  tenantSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  logoUrl?: string;
};

export async function createCheckoutAction(
  input: CreateCheckoutInput
): Promise<{ url?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Not authenticated' };

  const keycloakSub = session.user.keycloakSub;
  if (!keycloakSub) return { error: 'Missing SSO identity — please sign in via Keycloak' };

  const { priceId, tenantName, tenantSlug, firstName, lastName, email, logoUrl } = input;

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
    },
  });

  await masterDb.tenantUser.create({
    data: {
      keycloakSub,
      tenantId: tenant.id,
      role: 'TENANT_ADMIN',
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: tenant.id,
        keycloakSub,
        stripePriceId: priceId,
        tenantName,
        tenantSlug,
        adminFirstName: firstName,
        adminLastName: lastName,
        adminEmail: email,
        logoUrl: logoUrl ?? '',
      },
      success_url: `${appUrl}/portal/setup?session_id={CHECKOUT_SESSION_ID}&tenant_id=${tenant.id}`,
      cancel_url: `${appUrl}/portal/onboarding/details?priceId=${priceId}`,
    });

    if (!checkoutSession.url) {
      await masterDb.tenant.delete({ where: { id: tenant.id } });
      return { error: 'Failed to create Stripe session' };
    }

    return { url: checkoutSession.url };
  } catch {
    await masterDb.tenant.delete({ where: { id: tenant.id } });
    return { error: 'Failed to create checkout session' };
  }
}
