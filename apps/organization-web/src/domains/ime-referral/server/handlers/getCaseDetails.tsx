import imeReferralService from '../imeReferral.service';

const getCaseDetails = async (caseId: string) => {
  const caseDetails = await imeReferralService.getCaseDetails(caseId);
  return { success: true, result: caseDetails };
};
export default getCaseDetails;
