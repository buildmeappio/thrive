import caseStatusService from '../../caseStatus.service';
import { CreateCaseStatusInput } from '../../../types/CaseStatus';

const createCaseStatus = async (data: CreateCaseStatusInput) => {
  const result = await caseStatusService.createCaseStatus(data);
  return { success: true, result };
};

export default createCaseStatus;

