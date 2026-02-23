import imeReferralService from '../imeReferral.service';

const getCaseStatusById = async (id: string) => {
  const caseType = await imeReferralService.getCaseStatusById(id);
  return { success: true, result: caseType };
};
export default getCaseStatusById;
