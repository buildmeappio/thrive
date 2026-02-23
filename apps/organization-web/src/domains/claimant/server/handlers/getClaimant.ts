import claimantService from '../claimant.service';

const getClaimant = async (token: string) => {
  const claimant = await claimantService.getClaimant(token);
  return { success: true, result: claimant };
};
export default getClaimant;
