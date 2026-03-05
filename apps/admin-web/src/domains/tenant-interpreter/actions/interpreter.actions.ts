'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantInterpreterService } from '../server/interpreter.service';
import { InterpreterFilters, InterpreterData } from '../types/InterpreterData';

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
async function getTenantDbFromHeaders() {
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
 * Get interpreters for tenant
 */
export async function getTenantInterpreters(filters: InterpreterFilters = {}): Promise<{
  data: InterpreterData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const interpreterService = createTenantInterpreterService(prisma);
  return await interpreterService.getInterpreters(filters);
}
