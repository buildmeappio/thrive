import imeReferralService from '../imeReferral.service';

const getExaminationBenefits = async (examinationTypeId: string) => {
  const claimTypes = await imeReferralService.getExaminationBenefits(examinationTypeId);
  return { success: true, result: claimTypes };
};
export default getExaminationBenefits;
