import caseTypeService from '../../caseType.service';
import { CreateCaseTypeInput } from '../../../types/CaseType';

const createCaseType = async (data: CreateCaseTypeInput) => {
  const result = await caseTypeService.createCaseType(data);
  return { success: true, result };
};

export default createCaseType;

