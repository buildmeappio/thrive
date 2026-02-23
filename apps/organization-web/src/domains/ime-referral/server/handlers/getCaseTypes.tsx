import imeReferralService from '../imeReferral.service';

const getCaseTypes = async () => {
  const caseTypes = await imeReferralService.getCaseTypes();
  return { success: true, result: caseTypes };
};
export default getCaseTypes;
