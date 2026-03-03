import 'server-only';
import masterDb from '@thrive/database-master/db';

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const existing = await masterDb.tenant.findUnique({
    where: { subdomain: slug },
    select: { id: true },
  });
  return existing === null;
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

export async function getProvisioningJobBySessionId(stripeSessionId: string) {
  return masterDb.provisioningJob.findUnique({
    where: { stripeSessionId },
    select: { status: true, errorMessage: true, tenantSlug: true },
  });
}
