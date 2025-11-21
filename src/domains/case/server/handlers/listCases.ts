import caseService from "../case.service";
import { CaseDto } from "../dto/case.dto";

const listCases = async (assignToUserId?: string) => {
  let assignToId: string | undefined;

  if (assignToUserId) {
    assignToId = await caseService.getAssignTo(assignToUserId);
  }

  const cases = await caseService.listCases(assignToId);
  return Promise.all(cases.map(async (e) => await CaseDto.toCaseDto(e)));
};

export default listCases;
