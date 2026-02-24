/**
 * Tenant database provisioning - creates a new PostgreSQL database per tenant
 * and applies the tenant schema (from @thrive/database migrations).
 */
import { Pool } from 'pg';
import { execSync } from 'child_process';
import * as path from 'path';
import { existsSync } from 'fs';

/**
 * Parse a PostgreSQL URL and return connection params.
 * Replaces the database name with the target db for CREATE DATABASE.
 */
function getAdminConnectionUrl(baseUrl: string, targetDb = 'postgres'): string {
  const match = baseUrl.match(/^(postgresql:\/\/[^/]+)\/([^?]*)(\?.*)?$/);
  if (!match) {
    throw new Error(`Invalid database URL: ${baseUrl}`);
  }
  const [, base, , query] = match;
  return `${base}/${targetDb}${query ?? ''}`;
}

/**
 * Create a new tenant database and run tenant migrations.
 * @param tenantId - UUID of the tenant (used for database name)
 * @param baseConnectionUrl - Base URL (e.g. MASTER_DATABASE_URL or DATABASE_URL) to derive host/port/user/pass
 */
export async function createTenantDatabase(
  tenantId: string,
  baseConnectionUrl: string
): Promise<string> {
  const sanitizedId = tenantId.replace(/-/g, '_');
  const databaseName = `thrive_tenant_${sanitizedId}`;

  const adminUrl = getAdminConnectionUrl(baseConnectionUrl, 'postgres');
  const pool = new Pool({ connectionString: adminUrl });

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error(`Invalid database name: ${databaseName}`);
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }

  const tenantDbUrl = getAdminConnectionUrl(baseConnectionUrl, databaseName);

  // Run tenant migrations from @thrive/database (resolve from monorepo root)
  const possibleRoots = [
    path.resolve(process.cwd(), 'packages', 'database'),
    path.resolve(process.cwd(), '..', 'packages', 'database'),
    path.join(path.dirname(path.dirname(__dirname)), 'database'),
  ];
  const databasePackagePath = possibleRoots.find(p => existsSync(path.join(p, 'prisma.config.ts')));
  if (!databasePackagePath) {
    throw new Error('Could not find @thrive/database package. Ensure packages/database exists.');
  }

  execSync('pnpm prisma migrate deploy', {
    cwd: databasePackagePath,
    env: {
      ...process.env,
      DATABASE_URL: tenantDbUrl,
    },
    stdio: 'inherit',
  });

  return databaseName;
}

/**
 * Drop a tenant database (use with caution).
 */
export async function dropTenantDatabase(
  databaseName: string,
  baseConnectionUrl: string
): Promise<void> {
  const adminUrl = getAdminConnectionUrl(baseConnectionUrl, 'postgres');
  const pool = new Pool({ connectionString: adminUrl });

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error(`Invalid database name: ${databaseName}`);
  }

  try {
    const client = await pool.connect();
    try {
      await client.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}
