import caseService, { ListCasesFilter } from "../case.service";
import CaseDto from "../dto/case.dto";

const listCases = async (filter?: ListCasesFilter) => {
  const where = await caseService.convertFilterToWhere(filter);
  const cases = await caseService.listCases(where);
  return cases.map((e) => CaseDto.toCaseDto(e));
};

export default listCases;
