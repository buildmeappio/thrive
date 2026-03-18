'use server';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import interpreterService from '../server/interpreter.service';

const deleteInterpreter = async (id: string) => {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma;
  await interpreterService.deleteInterpreter(id, db);
  return { success: true };
};

export default deleteInterpreter;
