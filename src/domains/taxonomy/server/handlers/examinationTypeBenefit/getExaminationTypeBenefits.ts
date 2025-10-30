import examinationTypeBenefitService from '../../examinationTypeBenefit.service';

const getExaminationTypeBenefits = async () => {
  const result = await examinationTypeBenefitService.getExaminationTypeBenefits();
  return { success: true, result };
};

export default getExaminationTypeBenefits;

