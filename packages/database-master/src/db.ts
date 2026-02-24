import { PrismaClient, Prisma } from '../generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prismaMaster: PrismaClient };

const connectionString = process.env.MASTER_DATABASE_URL;
if (!connectionString) {
  throw new Error('MASTER_DATABASE_URL environment variable is not set');
}

const sslRequired = process.env.DATABASE_SSL_REQUIRED === 'true';

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

const prisma = globalForPrisma.prismaMaster ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaMaster = prisma;
}

if (typeof window === 'undefined') {
  if (
    !(global as unknown as { __prismaMasterDisconnectHandlerRegistered?: boolean })
      .__prismaMasterDisconnectHandlerRegistered
  ) {
    process.once('beforeExit', async () => {
      await prisma.$disconnect();
    });
    (
      global as unknown as { __prismaMasterDisconnectHandlerRegistered?: boolean }
    ).__prismaMasterDisconnectHandlerRegistered = true;
  }
}

export default prisma;
