import * as caseTypeService from '../../caseType.service';

const getCaseTypeById = async (id: string) => {
  const result = await caseTypeService.getCaseTypeById(id);
  return { success: true, result };
};

export default getCaseTypeById;
