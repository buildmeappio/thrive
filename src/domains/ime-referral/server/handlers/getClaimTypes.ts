import imeReferralService from '../imeReferral.service';

const getClaimTypes = async () => {
  const claimTypes = await imeReferralService.getClaimTypes();
  return { success: true, result: claimTypes };
};
export default getClaimTypes;
