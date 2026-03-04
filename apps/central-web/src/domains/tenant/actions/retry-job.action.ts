'use server';
import masterDb from '@thrive/database-master/db';
import { enqueueProvisionJob } from '@/domains/tenant/server/enqueue-provision-job';

export async function retryProvisioningJobAction(
  stripeSessionId: string
): Promise<{ success: boolean; error?: string }> {
  const tenant = await masterDb.tenant.findFirst({
    where: { stripeCheckoutSessionId: stripeSessionId },
    include: {
      subscription: true,
      users: true,
    },
  });

  if (!tenant) return { success: false, error: 'Tenant not found' };
  if (!tenant.provisionErrorMessage)
    return { success: false, error: 'Provisioning has not failed' };

  const tenantUser = tenant.users[0];
  if (!tenantUser) return { success: false, error: 'Tenant admin not found' };

  const user = await masterDb.user.findFirst({
    where: { keycloakSub: tenantUser.keycloakSub },
  });
  if (!user) return { success: false, error: 'User not found' };

  const subscription = tenant.subscription;
  if (!subscription) return { success: false, error: 'Subscription not found' };

  await masterDb.tenant.update({
    where: { id: tenant.id },
    data: { provisionErrorMessage: null, provisionStep: null },
  });

  await enqueueProvisionJob({
    tenantId: tenant.id,
    stripeSessionId: stripeSessionId,
    keycloakSub: tenantUser.keycloakSub,
    tenantName: tenant.name,
    tenantSlug: tenant.subdomain,
    logoUrl: tenant.logoUrl,
    stripePriceId: subscription.stripePriceId,
    adminFirstName: user.firstName ?? '',
    adminLastName: user.lastName ?? '',
    adminEmail: user.email,
    stripeSubId: subscription.stripeSubscriptionId,
    stripeCustomerId: subscription.stripeCustomerId,
  });

  return { success: true };
}
