import * as languageService from "../../language.service";
import { CreateLanguageInput } from "../../../types/Language";

const createLanguage = async (data: CreateLanguageInput) => {
  const result = await languageService.createLanguage(data);
  return { success: true, result };
};

export default createLanguage;
