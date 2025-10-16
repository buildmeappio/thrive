import imeReferralService from '../imeReferral.service';

const getCaseList = async (userId?: string, status?: string, take?: number) => {
  const claimTypes = await imeReferralService.getCaseList(userId, status, take);
  return { success: true, result: claimTypes };
};
export default getCaseList;
