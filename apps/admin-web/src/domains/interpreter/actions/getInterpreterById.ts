'use server';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import interpreterService from '../server/interpreter.service';
import { InterpreterDto } from '../server/dto/interpreter.dto';

const getInterpreterById = async (id: string) => {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma;
  const interpreter = await interpreterService.getInterpreterById(id, db);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default getInterpreterById;
