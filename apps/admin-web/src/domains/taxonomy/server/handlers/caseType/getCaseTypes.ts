import * as caseTypeService from '../../caseType.service';

const getCaseTypes = async () => {
  const result = await caseTypeService.getCaseTypes();
  return { success: true, result };
};

export default getCaseTypes;
