'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import { getTransporters as handlerGetTransporters } from '../handlers/getTransporters';

export async function getTransporters(page = 1, limit = 10, search = '') {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma;
  return await handlerGetTransporters(page, limit, search, db);
}
