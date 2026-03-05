import 'server-only';
import { PrismaClient } from '@thrive/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import masterDb from '@thrive/database-master/db';

/**
 * Cache for tenant Prisma clients
 * Key: tenantId, Value: PrismaClient
 */
const tenantPrismaClients = new Map<string, PrismaClient>();

/**
 * Global cache for Next.js hot reload (development)
 */
const globalForTenantPrisma = global as unknown as {
  tenantPrismaClients?: Map<string, PrismaClient>;
};

// Use global cache in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  if (!globalForTenantPrisma.tenantPrismaClients) {
    globalForTenantPrisma.tenantPrismaClients = tenantPrismaClients;
  }
}

const cachedClients = globalForTenantPrisma.tenantPrismaClients ?? tenantPrismaClients;

/**
 * Build tenant database URL from base URL and database name
 */
function buildTenantDbUrl(baseUrl: string, databaseName: string): string {
  const match = baseUrl.match(/^(postgresql:\/\/[^/]+)\/([^?]*)(\?.*)?$/);
  if (!match) throw new Error(`Invalid database URL: ${baseUrl}`);
  const [, base, , query] = match;
  return `${base}/${databaseName}${query ?? ''}`;
}

/**
 * Create a Prisma client for a tenant database
 */
function createTenantPrisma(databaseUrl: string): PrismaClient {
  const sslRequired = process.env.DATABASE_SSL_REQUIRED === 'true';
  const pool = new Pool({
    connectionString: databaseUrl,
    max: parseInt(process.env.DATABASE_POOL_MAX ?? '10'),
    idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT ?? '30000'),
    connectionTimeoutMillis: parseInt(process.env.DATABASE_POOL_CONNECTION_TIMEOUT ?? '5000'),
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? [{ level: 'error', emit: 'stdout' }] : [],
    errorFormat: 'pretty',
  } as never);
}

/**
 * Get tenant Prisma client by tenantId
 * Caches clients to avoid creating multiple connections for the same tenant
 */
export async function getTenantDb(tenantId: string): Promise<PrismaClient> {
  // Check cache first
  if (cachedClients.has(tenantId)) {
    return cachedClients.get(tenantId)!;
  }

  // Get tenant from master DB
  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
    select: { databaseName: true },
  });

  if (!tenant || !tenant.databaseName) {
    throw new Error(`Tenant ${tenantId} not found or database not provisioned`);
  }

  const baseUrl = process.env.MASTER_DATABASE_URL || process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error('MASTER_DATABASE_URL or DATABASE_URL must be set');
  }

  const tenantDbUrl = buildTenantDbUrl(baseUrl, tenant.databaseName);
  const prisma = createTenantPrisma(tenantDbUrl);

  // Cache the client
  cachedClients.set(tenantId, prisma);

  // Register shutdown handler for this specific client (only once)
  if (typeof window === 'undefined') {
    process.once('beforeExit', async () => {
      await prisma.$disconnect();
      cachedClients.delete(tenantId);
    });
  }

  return prisma;
}
