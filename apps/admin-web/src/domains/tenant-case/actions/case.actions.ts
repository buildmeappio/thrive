'use server';

import { headers } from 'next/headers';
import masterDb from '@thrive/database-master/db';
import { getTenantDb } from '@/lib/tenant-db';
import { createTenantCaseService } from '../server/case.service';
import { CaseData } from '../types/CaseData';

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
 * Get cases for tenant
 */
export async function getTenantCases(): Promise<CaseData[]> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const caseService = createTenantCaseService(prisma);
  return await caseService.getCases();
}

/**
 * Get case types for tenant
 */
export async function getTenantCaseTypes(): Promise<string[]> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const caseService = createTenantCaseService(prisma);
  return await caseService.getCaseTypes();
}

/**
 * Get case statuses for tenant
 */
export async function getTenantCaseStatuses(): Promise<string[]> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const caseService = createTenantCaseService(prisma);
  return await caseService.getCaseStatuses();
}

/**
 * Get priority levels for tenant
 */
export async function getTenantPriorityLevels(): Promise<string[]> {
  const tenantDbResult = await getTenantDbFromHeaders();
  if (!tenantDbResult) {
    throw new Error('Tenant not found');
  }

  const { prisma } = tenantDbResult;
  const caseService = createTenantCaseService(prisma);
  return await caseService.getPriorityLevels();
}
