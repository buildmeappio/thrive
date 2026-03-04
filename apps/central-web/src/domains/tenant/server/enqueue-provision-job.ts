import 'server-only';

export type ProvisionJobData = {
  tenantId: string;
  stripeSessionId: string;
  keycloakSub: string;
  tenantName: string;
  tenantSlug: string;
  logoUrl: string | null;
  stripePriceId: string | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  stripeSubId: string | null;
  stripeCustomerId: string | null;
};

export async function enqueueProvisionJob(data: ProvisionJobData): Promise<void> {
  const workerUrl = process.env.WORKER_URL;
  const secret = process.env.WORKER_ENQUEUE_SECRET;
  if (!workerUrl) throw new Error('WORKER_URL is not set');
  if (!secret) throw new Error('WORKER_ENQUEUE_SECRET is not set');

  const res = await fetch(`${workerUrl}/enqueue-provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `Worker returned ${res.status}`);
  }
}
