import imeReferralService from '../imeReferral.service';

const getReferrals = async () => {
  const referrals = await imeReferralService.getCases();
  return { success: true, result: referrals };
};
export default getReferrals;
