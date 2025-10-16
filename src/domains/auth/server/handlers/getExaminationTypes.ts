import authService from '../auth.service';

const getExaminationTypes = async () => {
  const examinationTypes = await authService.getExaminationTypes();
  return examinationTypes;
};

export default getExaminationTypes;
