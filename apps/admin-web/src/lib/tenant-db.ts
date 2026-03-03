import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@thrive/database';

// Process-level cache: one connection pool per tenant slug per server process
const clientCache = new Map<string, PrismaClient>();

/**
 * Resolves the Prisma client for the current request's tenant.
 * Reads x-tenant-slug from request headers (forwarded by middleware).
 * Safe to call from Server Components, Route Handlers, and Server Actions.
 */
export async function getTenantDb(): Promise<PrismaClient> {
  const h = await headers();
  const slug = h.get('x-tenant-slug');
  if (!slug) {
    throw new Error(
      'No tenant context: x-tenant-slug header is missing. Access this app via a tenant subdomain (e.g. acme.localhost:3000).'
    );
  }
  return getClientBySlug(slug);
}

/**
 * Resolves the Prisma client for a given tenant subdomain slug.
 * Looks up the tenant in the master DB, builds the connection URL, and caches the client.
 */
export async function getClientBySlug(slug: string): Promise<PrismaClient> {
  if (clientCache.has(slug)) return clientCache.get(slug)!;

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain: slug },
    select: { databaseName: true },
  });

  if (!tenant?.databaseName) {
    throw new Error(
      `Tenant "${slug}" not found in master DB or its database has not been provisioned yet.`
    );
  }

  const url = buildTenantUrl(process.env.MASTER_DATABASE_URL!, tenant.databaseName);
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter } as never);

  clientCache.set(slug, client);
  return client;
}

/**
 * Replaces the database name in a PostgreSQL connection string.
 * e.g. postgresql://user:pass@host:5442/master_db -> postgresql://user:pass@host:5442/tenant_abc
 */
function buildTenantUrl(masterUrl: string, databaseName: string): string {
  return masterUrl.replace(/\/([^/?]+)(\?.*)?$/, `/${databaseName}$2`);
}
