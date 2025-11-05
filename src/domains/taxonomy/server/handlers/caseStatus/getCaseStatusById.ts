import caseStatusService from '../../caseStatus.service';

const getCaseStatusById = async (id: string) => {
  const result = await caseStatusService.getCaseStatusById(id);
  return { success: true, result };
};

export default getCaseStatusById;

