import * as caseTypeService from "../../caseType.service";
import { UpdateCaseTypeInput } from "../../../types/CaseType";

const updateCaseType = async (id: string, data: UpdateCaseTypeInput) => {
  const result = await caseTypeService.updateCaseType(id, data);
  return { success: true, result };
};

export default updateCaseType;
