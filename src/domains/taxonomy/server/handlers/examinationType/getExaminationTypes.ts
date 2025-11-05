import examinationTypeService from '../../examinationType.service';

const getExaminationTypes = async () => {
  const result = await examinationTypeService.getExaminationTypes();
  return { success: true, result };
};

export default getExaminationTypes;

