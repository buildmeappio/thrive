import 'server-only';
import { stripe } from '@/domains/stripe/server/stripe.client';
import masterDb from '@thrive/database-master/db';
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

  if (!meta?.keycloakSub || !meta?.tenantSlug) return;

  // Create the provisioning job record
  // The worker will pick it up via Agenda polling
  await masterDb.provisioningJob.create({
    data: {
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
      status: 'PENDING',
    },
  });
}
