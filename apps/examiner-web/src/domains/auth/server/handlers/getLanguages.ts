import { languageService } from '../services';

const getLanguages = async () => {
  const languages = await languageService.getLanguages();
  return languages;
};

export default getLanguages;
