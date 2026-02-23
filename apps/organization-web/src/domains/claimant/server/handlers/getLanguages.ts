import claimantService from '../claimant.service';

const getLanguages = async () => {
  const languages = await claimantService.getLanguages();
  return { success: true, result: languages };
};
export default getLanguages;
