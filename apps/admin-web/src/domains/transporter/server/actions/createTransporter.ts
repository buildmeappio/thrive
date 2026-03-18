'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import type { CreateTransporterData } from '../../types/TransporterData';

export async function createTransporter(data: CreateTransporterData) {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma;
  const { createTransporter: handlerCreateTransporter } =
    await import('../handlers/createTransporter');
  return await handlerCreateTransporter(data, db);
}
