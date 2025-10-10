import imeReferralService from '../imeReferral.service';

const getCaseStatuses = async () => {
  const caseTypes = await imeReferralService.getCaseStatuses();
  return { success: true, result: caseTypes };
};
export default getCaseStatuses;
