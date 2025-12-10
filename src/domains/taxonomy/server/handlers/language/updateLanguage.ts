import * as languageService from '../../language.service';
import { UpdateLanguageInput } from '../../../types/Language';

const updateLanguage = async (id: string, data: UpdateLanguageInput) => {
  const result = await languageService.updateLanguage(id, data);
  return { success: true, result };
};

export default updateLanguage;

