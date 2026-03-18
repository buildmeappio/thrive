import 'server-only';
import { stripe } from '@/domains/stripe/server/stripe.client';
import masterDb from '@thrive/database-master/db';
import { enqueueProvisionJob } from '@/domains/tenant/server/enqueue-provision-job';
import { isSlugAvailable } from '@/domains/tenant/server/tenant.service';
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

  // Validate required metadata
  if (!meta?.keycloakSub || !meta?.tenantSlug || !meta?.tenantName) {
    console.error('Missing required metadata in checkout session', session.id);
    return;
  }

  const tenantId = meta?.tenantId;

  // Find existing tenant or create new one
  let tenant = tenantId
    ? await masterDb.tenant.findUnique({
        where: { id: tenantId },
        include: { subscription: true, users: true },
      })
    : null;

  if (!tenant) {
    // Tenant doesn't exist, check if slug is available
    if (!(await isSlugAvailable(meta.tenantSlug))) {
      console.error(`Slug ${meta.tenantSlug} is no longer available for session ${session.id}`);
      return;
    }

    // Create new tenant
    tenant = await masterDb.tenant.create({
      data: {
        subdomain: meta.tenantSlug,
        name: meta.tenantName,
        status: 'DRAFT',
        databaseName: '',
        logoUrl: meta.logoUrl || null,
        stripeCheckoutSessionId: session.id,
        pendingStripePriceId: null, // Clear pending priceId after payment
      },
      include: { subscription: true, users: true },
    });

    // Create tenant user relationship
    await masterDb.tenantUser.create({
      data: {
        keycloakSub: meta.keycloakSub,
        tenantId: tenant.id,
        role: 'TENANT_ADMIN',
      },
    });
  } else {
    // Update existing tenant
    if (tenant.status !== 'DRAFT') {
      console.error(`Tenant ${tenant.id} is not in DRAFT status, cannot process payment`);
      return;
    }

    // Update tenant with checkout session ID and clear pending priceId
    await masterDb.tenant.update({
      where: { id: tenant.id },
      data: {
        stripeCheckoutSessionId: session.id,
        pendingStripePriceId: null, // Clear pending priceId after payment
      },
    });

    // Ensure tenant user exists
    const existingUser = tenant.users.find(u => u.keycloakSub === meta.keycloakSub);
    if (!existingUser) {
      await masterDb.tenantUser.create({
        data: {
          keycloakSub: meta.keycloakSub,
          tenantId: tenant.id,
          role: 'TENANT_ADMIN',
        },
      });
    }
  }

  // Create or update subscription
  if (tenant.subscription) {
    // Update existing subscription
    await masterDb.subscription.update({
      where: { id: tenant.subscription.id },
      data: {
        stripePriceId: meta.stripePriceId || null,
        stripeSubscriptionId:
          typeof session.subscription === 'string' ? session.subscription : null,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        status: 'ACTIVE',
      },
    });
  } else {
    // Create new subscription
    await masterDb.subscription.create({
      data: {
        tenantId: tenant.id,
        stripePriceId: meta.stripePriceId || null,
        stripeSubscriptionId:
          typeof session.subscription === 'string' ? session.subscription : null,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        status: 'ACTIVE',
      },
    });
  }

  // Enqueue provision job to set up the tenant
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
