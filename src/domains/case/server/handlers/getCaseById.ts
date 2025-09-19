import caseService from "../case.service";
import CaseDto from "../dto/case.dto";

const getCaseById = async (id: string, userId: string) => {
  const casee = await caseService.getCaseById(id);
  await caseService.doesCaseBelongToUser(casee, userId);
  return CaseDto.toCaseDetailDto(casee);
};

export default getCaseById;
