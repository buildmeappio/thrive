import imeReferralService from '../imeReferral.service';

const getExamTypes = async () => {
  const examTypes = await imeReferralService.getExamTypes();
  return { success: true, result: examTypes };
};
export default getExamTypes;
