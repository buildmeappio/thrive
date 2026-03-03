import 'dotenv/config';
import { Agenda } from 'agenda';
import { PostgresBackend } from '@agendajs/postgres-backend';
import masterDb from '@thrive/database-master/db';
import { provisionTenantHandler, type ProvisionJobData } from './workers/provision.worker';

if (!process.env.MASTER_DATABASE_URL) {
  throw new Error('MASTER_DATABASE_URL is not set');
}

// Stuck job threshold: jobs in RUNNING status for more than 30 minutes are considered stuck
const STUCK_JOB_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const STUCK_JOB_CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

const agenda = new Agenda({
  backend: new PostgresBackend({ connectionString: process.env.MASTER_DATABASE_URL! }),
  processEvery: '10 seconds',
});

// Define the job handler
agenda.define('provision-tenant', async job => {
  const data = job.attrs.data as ProvisionJobData;
  const { stripeSessionId } = data;

  // Update job status to RUNNING
  await masterDb.provisioningJob.update({
    where: { stripeSessionId },
    data: { status: 'RUNNING' },
  });

  try {
    await provisionTenantHandler(data);
  } catch (err) {
    // Error handling is done in provisionTenantHandler
    // It will update the job status to FAILED
    throw err;
  }
});

// Function to detect and reset stuck RUNNING jobs
async function resetStuckJobs(): Promise<void> {
  const threshold = new Date(Date.now() - STUCK_JOB_THRESHOLD_MS);

  const stuckJobs = await masterDb.provisioningJob.findMany({
    where: {
      status: 'RUNNING',
      updatedAt: {
        lt: threshold,
      },
    },
  });

  if (stuckJobs.length > 0) {
    console.log(`[worker] Found ${stuckJobs.length} stuck job(s), resetting to PENDING...`);

    for (const job of stuckJobs) {
      await masterDb.provisioningJob.update({
        where: { id: job.id },
        data: {
          status: 'PENDING',
          errorMessage: `Job was stuck in RUNNING status and has been reset. Original error: ${job.errorMessage || 'Unknown'}`,
        },
      });

      // Re-enqueue the job
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

      console.log(`[worker] Re-enqueued stuck job: ${job.stripeSessionId}`);
    }
  }
}

// Periodically check for stuck jobs
let stuckJobCheckInterval: NodeJS.Timeout | null = null;

async function startStuckJobMonitor(): Promise<void> {
  stuckJobCheckInterval = setInterval(async () => {
    try {
      await resetStuckJobs();
    } catch (err) {
      console.error('[worker] Error checking for stuck jobs:', err);
    }
  }, STUCK_JOB_CHECK_INTERVAL_MS);
}

async function start(): Promise<void> {
  console.log('[worker] Starting Agenda worker...');

  // Start the stuck job monitor
  await startStuckJobMonitor();

  // Process any existing PENDING jobs on startup
  const pendingJobs = await masterDb.provisioningJob.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  });

  if (pendingJobs.length > 0) {
    console.log(`[worker] Found ${pendingJobs.length} pending job(s) on startup, enqueuing...`);
    for (const job of pendingJobs) {
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
    }
  }

  // Start Agenda
  await agenda.start();
  console.log('[worker] Agenda worker started and ready to process jobs');
}

function stop(): void {
  console.log('[worker] Shutting down...');

  if (stuckJobCheckInterval) {
    clearInterval(stuckJobCheckInterval);
  }

  agenda.stop().then(() => {
    console.log('[worker] Agenda stopped');
    masterDb.$disconnect().then(() => {
      console.log('[worker] Database disconnected');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', stop);
process.on('SIGINT', stop);

start().catch(err => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
