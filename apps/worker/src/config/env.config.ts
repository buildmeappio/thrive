import 'dotenv/config';
import z from 'zod';

const envSchema = z.object({
  MASTER_DATABASE_URL: z.string(),
  WORKER_ENQUEUE_SECRET: z.string(),
  WORKER_HTTP_PORT: z.coerce.number().default(3004),
  ORPHAN_CLEANUP_INTERVAL: z.coerce.number().default(60 * 60 * 1000),
  PROCESS_EVERY: z.string().default('10 seconds'),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  DATABASE_POOL_IDLE_TIMEOUT: z.coerce.number().default(30000),
  DATABASE_POOL_CONNECTION_TIMEOUT: z.coerce.number().default(5000),
  DATABASE_SSL_REQUIRED: z
    .string()
    .transform(val => val === 'true')
    .default(false),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('[worker] Invalid environment variables:', z.prettifyError(env.error));
  process.exit(1);
}

const envConfig = {
  database: {
    url: env.data.MASTER_DATABASE_URL,
    pool: {
      max: env.data.DATABASE_POOL_MAX,
      idleTimeoutMillis: env.data.DATABASE_POOL_IDLE_TIMEOUT,
      connectionTimeoutMillis: env.data.DATABASE_POOL_CONNECTION_TIMEOUT,
      ssl: env.data.DATABASE_SSL_REQUIRED ? { rejectUnauthorized: false } : undefined,
    },
  },
  worker: {
    enqueueSecret: env.data.WORKER_ENQUEUE_SECRET,
    httpPort: env.data.WORKER_HTTP_PORT,
    orphanCleanupInterval: env.data.ORPHAN_CLEANUP_INTERVAL,
    processEvery: env.data.PROCESS_EVERY,
  },
};

export default Object.freeze(envConfig);
