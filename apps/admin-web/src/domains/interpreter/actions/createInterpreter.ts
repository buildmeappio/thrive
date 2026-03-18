'use server';

import { getTenantDbFromHeaders } from '@/domains/organization/actions/tenant-helpers';
import interpreterService from '../server/interpreter.service';
import { InterpreterDto } from '../server/dto/interpreter.dto';

type CreateInterpreterInput = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  languageIds: string[];
};

type CreateInterpreterResult =
  | {
      success: true;
      interpreter: ReturnType<typeof InterpreterDto.toInterpreterData>;
    }
  | { success: false; message: string };

const createInterpreter = async (
  data: CreateInterpreterInput
): Promise<CreateInterpreterResult> => {
  try {
    const tenantResult = await getTenantDbFromHeaders();
    const db = tenantResult?.prisma;
    const interpreter = await interpreterService.createInterpreter(data, db);
    return {
      success: true,
      interpreter: InterpreterDto.toInterpreterData(interpreter),
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : 'Failed to create interpreter';
    return { success: false, message };
  }
};

export default createInterpreter;
