'use server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { stripe } from '@/domains/stripe/server/stripe.client';
import { headers } from 'next/headers';

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

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
      keycloakSub,
      stripePriceId: priceId,
      tenantName,
      tenantSlug,
      adminFirstName: firstName,
      adminLastName: lastName,
      adminEmail: email,
      logoUrl: logoUrl ?? '',
    },
    success_url: `${appUrl}/portal/setup?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/portal/onboarding/details?priceId=${priceId}`,
  });

  if (!checkoutSession.url) return { error: 'Failed to create Stripe session' };

  return { url: checkoutSession.url };
}
