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
      // Check if it's a database permission/connection error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const isDatabaseError =
        errorMessage.toLowerCase().includes("denied access") ||
        errorMessage.toLowerCase().includes("permission denied") ||
        errorMessage.toLowerCase().includes("authentication failed") ||
        errorMessage.toLowerCase().includes("connection") ||
        errorMessage.toLowerCase().includes("prisma") ||
        errorMessage.toLowerCase().includes("database");

      if (isDatabaseError) {
        // Log the actual database error for debugging
        console.error("Database error in getYearsOfExperience:", error);
        throw HttpError.fromError(
          error,
          "Database connection error. Please check your database configuration and permissions.",
          503,
        );
      }

      throw HttpError.fromError(
        error,
        ErrorMessages.YEARS_OF_EXPERIENCE_NOT_FOUND,
        500,
      );
    }
  }
}

export default new YearsOfExperienceService();
