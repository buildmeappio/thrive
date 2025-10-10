import imeReferralService from '../imeReferral.service';

const getCaseList = async () => {
  const claimTypes = await imeReferralService.getCaseList();
  return { success: true, result: claimTypes };
};
export default getCaseList;
