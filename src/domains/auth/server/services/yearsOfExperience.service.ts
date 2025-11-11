import prisma from "@/lib/db";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

class YearsOfExperienceService {
  async getYearsOfExperience() {
    try {
      const years = await prisma.yearsOfExperience.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: "asc",
        },
      });

      return years;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.YEARS_OF_EXPERIENCE_NOT_FOUND,
        500
      );
    }
  }
}

export default new YearsOfExperienceService();
