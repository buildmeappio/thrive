import examinationTypeBenefitService from '../../examinationTypeBenefit.service';

const getExaminationTypeBenefitById = async (id: string) => {
  const result = await examinationTypeBenefitService.getExaminationTypeBenefitById(id);
  return { success: true, result };
};

export default getExaminationTypeBenefitById;

