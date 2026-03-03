'use server';
import masterDb from '@thrive/database-master/db';
import { Agenda } from 'agenda';
import { PostgresBackend } from '@agendajs/postgres-backend';

export async function retryProvisioningJobAction(
  stripeSessionId: string
): Promise<{ success: boolean; error?: string }> {
  const job = await masterDb.provisioningJob.findUnique({ where: { stripeSessionId } });
  if (!job) return { success: false, error: 'Job not found' };
  if (job.status !== 'FAILED') return { success: false, error: 'Job is not in a failed state' };

  // Reset status
  await masterDb.provisioningJob.update({
    where: { stripeSessionId },
    data: { status: 'PENDING', errorMessage: null },
  });

  // Re-enqueue via Agenda
  const agenda = new Agenda({
    backend: new PostgresBackend({ connectionString: process.env.MASTER_DATABASE_URL! }),
  });

  await agenda.now('provision-tenant', {
    jobId: job.id,
    stripeSessionId: job.stripeSessionId,
    keycloakSub: job.keycloakSub,
    tenantName: job.tenantName,
    tenantSlug: job.tenantSlug,
    logoUrl: job.logoUrl,
    stripePriceId: job.stripePriceId,
    adminFirstName: job.adminFirstName,
    adminLastName: job.adminLastName,
    adminEmail: job.adminEmail,
    stripeSubId: job.stripeSubId,
    stripeCustomerId: job.stripeCustomerId,
  });

  await agenda.close();

  return { success: true };
}
