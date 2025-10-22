import imeReferralService from '../imeReferral.service';

const getCaseData = async (caseId: string) => {
  const caseDetails = await imeReferralService.getCaseData(caseId);
  return { success: true, result: caseDetails };
};
export default getCaseData;
