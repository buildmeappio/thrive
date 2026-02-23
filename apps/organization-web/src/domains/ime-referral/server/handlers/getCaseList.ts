import imeReferralService from '../imeReferral.service';

const getCaseList = async (
  userId?: string,
  status?: string,
  take?: number,
  excludeStatuses?: string | string[]
) => {
  const claimTypes = await imeReferralService.getCaseList(userId, status, take, excludeStatuses);
  return { success: true, result: claimTypes };
};
export default getCaseList;
