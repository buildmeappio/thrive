'use server';
import { toCaseDto } from '../dto/case.dto';
import * as CaseService from '../case.service';

const listCases = async (assignToUserId?: string) => {
  let assignToId: string | undefined;

  if (assignToUserId) {
    assignToId = await CaseService.getAssignTo(assignToUserId);
  }

  const cases = await CaseService.listCases(assignToId);
  return Promise.all(cases.map(async e => await toCaseDto(e)));
};

export default listCases;
