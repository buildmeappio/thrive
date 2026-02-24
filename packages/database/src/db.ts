import { PrismaClient, Prisma } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sslRequired = process.env.DATABASE_SSL_REQUIRED === 'true';

// Explicit pg.Pool lets us tune connection pool and SSL per-environment.
// Tune via env vars: DATABASE_POOL_MAX, DATABASE_POOL_IDLE_TIMEOUT, DATABASE_POOL_CONNECTION_TIMEOUT
const pool = new Pool({
  connectionString,
  max: parseInt(process.env.DATABASE_POOL_MAX ?? '10'),
  idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT ?? '30000'),
  connectionTimeoutMillis: parseInt(process.env.DATABASE_POOL_CONNECTION_TIMEOUT ?? '5000'),
  ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
});

const adapter = new PrismaPg(pool);

const prismaClientOptions: Prisma.PrismaClientOptions = {
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  errorFormat: 'pretty',
};

const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

// Prevent multiple instances during Next.js hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Register shutdown handler once per process (server-side only)
if (typeof window === 'undefined') {
  if (!(global as any).__prismaDisconnectHandlerRegistered) {
    process.once('beforeExit', async () => {
      await prisma.$disconnect();
    });
    (global as any).__prismaDisconnectHandlerRegistered = true;
  }
}

export default prisma;
