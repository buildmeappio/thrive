import * as caseStatusService from "../../caseStatus.service";

const getCaseStatuses = async () => {
  const result = await caseStatusService.getCaseStatuses();
  return { success: true, result };
};

export default getCaseStatuses;
