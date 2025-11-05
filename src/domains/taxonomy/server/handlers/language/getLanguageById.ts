import languageService from '../../language.service';

const getLanguageById = async (id: string) => {
  const result = await languageService.getLanguageById(id);
  return { success: true, result };
};

export default getLanguageById;

