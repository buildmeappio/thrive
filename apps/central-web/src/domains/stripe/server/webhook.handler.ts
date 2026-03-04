import 'server-only';
import { stripe } from '@/domains/stripe/server/stripe.client';
import masterDb from '@thrive/database-master/db';
import { enqueueProvisionJob } from '@/domains/tenant/server/enqueue-provision-job';
import type Stripe from 'stripe';

export async function handleStripeWebhook(body: string, signature: string): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    throw new Error('Invalid Stripe signature');
  }

  if (event.type !== 'checkout.session.completed') return;

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata;

  const tenantId = meta?.tenantId;
  if (!tenantId || !meta?.keycloakSub || !meta?.tenantSlug) return;

  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, status: true },
  });

  if (!tenant || tenant.status !== 'DRAFT') return;

  await masterDb.subscription.create({
    data: {
      tenantId: tenant.id,
      stripePriceId: meta.stripePriceId || null,
      stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
      status: 'ACTIVE',
    },
  });

  await masterDb.tenant.update({
    where: { id: tenant.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  await enqueueProvisionJob({
    tenantId: tenant.id,
    stripeSessionId: session.id,
    keycloakSub: meta.keycloakSub,
    tenantName: meta.tenantName,
    tenantSlug: meta.tenantSlug,
    logoUrl: meta.logoUrl || null,
    stripePriceId: meta.stripePriceId || null,
    adminFirstName: meta.adminFirstName,
    adminLastName: meta.adminLastName,
    adminEmail: meta.adminEmail,
    stripeSubId: typeof session.subscription === 'string' ? session.subscription : null,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
  });
}
