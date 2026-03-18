'use server';

import prisma from '@/lib/db';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import { PrismaClient } from '@thrive/database';

/**
 * Returns the Prisma client to use for examiner queries.
 * When request has tenant context (subdomain), returns tenant DB; otherwise default DB.
 */
export async function getExaminerDb(): Promise<{ db: PrismaClient; isTenant: boolean }> {
  const tenantResult = await getTenantDbFromHeaders();
  if (tenantResult) {
    return { db: tenantResult.prisma, isTenant: true };
  }
  return { db: prisma, isTenant: false };
}
