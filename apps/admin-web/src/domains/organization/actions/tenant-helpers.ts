'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { getTenantSessionFromCookies } from '@/domains/auth/server/better-auth/tenant-session';
import { PrismaClient } from '@thrive/database';
import { createTenantOrganizationService } from '../server/organizations.service';

/**
 * Extract subdomain from request headers
 */
async function extractSubdomainFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'auth') {
    return parts[0];
  }
  return null;
}

/**
 * Get tenant database from headers
 */
export async function getTenantDbFromHeaders(): Promise<{
  tenantId: string;
  prisma: PrismaClient;
} | null> {
  const subdomain = await extractSubdomainFromHeaders();
  if (!subdomain) {
    return null;
  }

  const tenant = await masterDb.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  });

  if (!tenant) {
    return null;
  }

  const tenantDb = await getTenantDb(tenant.id);
  return { tenantId: tenant.id, prisma: tenantDb };
}

/**
 * Get tenant context with verified session and service
 * This is a helper that combines tenant extraction, session verification, and service creation
 */
export async function getTenantContext() {
  // Get tenant database from headers
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    redirect('/access-denied');
  }

  const { tenantId, prisma } = tenantDbResult;

  // Get tenant from master DB to verify session
  const tenant = await masterDb.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    redirect('/access-denied');
  }

  // Verify tenant session
  const tenantSession = await getTenantSessionFromCookies(tenant.id);
  if (!tenantSession) {
    redirect('/access-denied');
  }

  // Create service instance with tenant DB
  const organizationService = createTenantOrganizationService(prisma);

  return {
    tenantId,
    tenant,
    tenantSession,
    prisma,
    organizationService,
  };
}
