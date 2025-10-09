import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

class LanguageService {
  async getLanguages() {
    try {
      const languages = await prisma.language.findMany({
        where: {
          deletedAt: null,
        },
      });

      return languages;
    } catch (error) {
      throw HttpError.fromError(error, ErrorMessages.LANGUAGES_NOT_FOUND, 500);
    }
  }
}

export default new LanguageService();
