import * as languageService from "../../language.service";

const getLanguages = async () => {
  const result = await languageService.getLanguages();
  return { success: true, result };
};

export default getLanguages;
