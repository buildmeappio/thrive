import imeReferralService from '../imeReferral.service';

const getCaseList = async (status?: string, take?: number) => {
  const claimTypes = await imeReferralService.getCaseList(status, take);
  return { success: true, result: claimTypes };
};
export default getCaseList;
