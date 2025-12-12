import * as caseStatusService from "../../caseStatus.service";
import { UpdateCaseStatusInput } from "../../../types/CaseStatus";

const updateCaseStatus = async (id: string, data: UpdateCaseStatusInput) => {
  const result = await caseStatusService.updateCaseStatus(id, data);
  return { success: true, result };
};

export default updateCaseStatus;
