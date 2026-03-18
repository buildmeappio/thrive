'use server';
import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import interpreterService from '../server/interpreter.service';
import { InterpreterDto } from '../server/dto/interpreter.dto';

type UpdateInterpreterInput = {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  languageIds?: string[];
};

const updateInterpreter = async (id: string, data: UpdateInterpreterInput) => {
  const tenantResult = await getTenantDbFromHeaders();
  const db = tenantResult?.prisma;
  const interpreter = await interpreterService.updateInterpreter(id, data, db);
  return InterpreterDto.toInterpreterData(interpreter);
};

export default updateInterpreter;
