import authService from '../auth.service';

const getExaminationTypes = async () => {
  const examinationTypes = await authService.getExaminationTypes();
  return { success: true, result: examinationTypes };
};
export default getExaminationTypes;
