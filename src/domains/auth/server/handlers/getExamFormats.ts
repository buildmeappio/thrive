import authService from '../auth.service';

const getExamFormats = async () => {
  const examFormats = await authService.getExamFormats();
  return { success: true, result: examFormats };
};

export default getExamFormats;
