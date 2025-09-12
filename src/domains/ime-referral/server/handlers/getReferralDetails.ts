import imeReferralService from '../imeReferral.service';

const getReferralDetails = async (referralId: string) => {
  const referral = await imeReferralService.getReferralDetails(referralId);
  return { success: true, result: referral };
};
export default getReferralDetails;
