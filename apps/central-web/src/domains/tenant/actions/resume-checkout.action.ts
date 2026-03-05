'use server';
import { auth } from '@/domains/auth/server/better-auth/auth';
import { stripe } from '@/domains/stripe/server/stripe.client';
import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';

type ResumeCheckoutInput = {
  tenantId: string;
};

export async function resumeCheckoutAction(
  input: ResumeCheckoutInput
): Promise<{ url?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: 'Not authenticated' };

  const keycloakSub = session.user.keycloakSub;
  if (!keycloakSub) return { error: 'Missing SSO identity — please sign in via Keycloak' };

  const { tenantId } = input;

  // Get tenant and verify ownership
  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
    include: {
      users: true,
      subscription: true,
    },
  });

  if (!tenant) {
    return { error: 'Tenant not found' };
  }

  // Verify user owns this tenant
  const tenantUser = tenant.users.find(u => u.keycloakSub === keycloakSub);
  if (!tenantUser) {
    return { error: 'Unauthorized' };
  }

  // Check if tenant is DRAFT and has no active subscription
  if (tenant.status !== 'DRAFT' || tenant.subscription?.status === 'ACTIVE') {
    return { error: 'Tenant is already active or payment is complete' };
  }

  // Check if tenant has pending priceId
  if (!tenant.pendingStripePriceId) {
    return { error: 'No pending payment found for this tenant' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  try {
    // Create new Stripe checkout session for the pending payment
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price: tenant.pendingStripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: tenant.id,
        keycloakSub,
        stripePriceId: tenant.pendingStripePriceId,
        tenantName: tenant.name,
        tenantSlug: tenant.subdomain,
        adminFirstName: session.user.firstName ?? '',
        adminLastName: session.user.lastName ?? '',
        adminEmail: session.user.email ?? '',
        logoUrl: tenant.logoUrl ?? '',
      },
      success_url: `${appUrl}/portal/setup?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/portal/tenants`,
    });

    if (!checkoutSession.url) {
      return { error: 'Failed to create Stripe session' };
    }

    return { url: checkoutSession.url };
  } catch {
    return { error: 'Failed to create checkout session' };
  }
}
