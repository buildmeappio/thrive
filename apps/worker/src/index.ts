import * as crypto from 'crypto';
import express from 'express';
import { provisionTenantHandler, type ProvisionJobData } from './workers/provision.worker';
import { provisionJobDataSchema } from './workers/provision.schema';
import { deleteOrphanDraftTenants } from './workers/orphan-cleanup';
import envConfig from './config/env.config';

type AgendaLike = {
  define: (name: string, processor: (job: { attrs: { data?: unknown } }) => Promise<void>) => void;
  now: (name: string, data: unknown) => Promise<unknown>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

let agenda: AgendaLike;

async function setupAgenda(): Promise<AgendaLike> {
  const { Agenda } = await import('agenda');
  const { PostgresBackend } = await import('@agendajs/postgres-backend');

  const initializedAgenda = new Agenda({
    backend: new PostgresBackend({ connectionString: envConfig.database.url, ensureSchema: false }),
    processEvery: envConfig.worker.processEvery,
  });

  initializedAgenda.define('provision-tenant', async job => {
    const data = job.attrs.data as ProvisionJobData;
    await provisionTenantHandler(data);
  });

  return initializedAgenda;
}

function validateEnqueueAuth(authHeader: string | undefined): boolean {
  const expected = `Bearer ${envConfig.worker.enqueueSecret}`;
  const received = authHeader ?? '';
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
}

const app = express();
app.use(express.json());

app.post('/enqueue-provision', async (req, res) => {
  if (!validateEnqueueAuth(req.headers.authorization)) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const parseResult = provisionJobDataSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issues = parseResult.error.issues ?? [];
      const messages = issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      res.status(400).json({ error: `Validation failed: ${messages}` });
      return;
    }
    const data = parseResult.data;
    await agenda.now('provision-tenant', data);
    res.json({ ok: true });
  } catch (err) {
    console.error('[worker] Enqueue failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Enqueue failed' });
  }
});

let httpServer: ReturnType<typeof app.listen> | null = null;
let orphanCleanupInterval: NodeJS.Timeout | null = null;

async function runOrphanCleanup(): Promise<void> {
  try {
    const deleted = await deleteOrphanDraftTenants();
    if (deleted > 0) {
      console.log(`[worker] Orphan cleanup: removed ${deleted} abandoned DRAFT tenant(s)`);
    }
  } catch (err) {
    console.error('[worker] Orphan cleanup failed:', err);
  }
}

async function start(): Promise<void> {
  console.log('[worker] Starting Agenda worker...');
  agenda = await setupAgenda();
  await agenda.start();
  console.log('[worker] Agenda worker started and ready to process jobs');

  httpServer = app.listen(envConfig.worker.httpPort, () => {
    console.log(
      `[worker] Express server listening on port ${envConfig.worker.httpPort} for job enqueue requests`
    );
  });

  await runOrphanCleanup();
  orphanCleanupInterval = setInterval(runOrphanCleanup, envConfig.worker.orphanCleanupInterval);
}

function stop(): void {
  console.log('[worker] Shutting down...');
  if (orphanCleanupInterval) {
    clearInterval(orphanCleanupInterval);
  }
  if (httpServer) {
    httpServer.close();
  }
  agenda.stop().then(() => {
    console.log('[worker] Agenda stopped');
    process.exit(0);
  });
}

process.on('SIGTERM', stop);
process.on('SIGINT', stop);

start().catch(err => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
