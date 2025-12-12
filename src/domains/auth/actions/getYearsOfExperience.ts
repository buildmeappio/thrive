"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";
import HttpError from "@/utils/httpError";

const getYearsOfExperience = async () => {
  try {
    const years = await authHandlers.getYearsOfExperience();
    return years;
  } catch (error) {
    console.error("Error in getYearsOfExperience action:", error);

    // If it's an HttpError, preserve the original error message and status
    if (error instanceof HttpError) {
      throw error;
    }

    // Check if it's a database error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDatabaseError =
      errorMessage.toLowerCase().includes("denied access") ||
      errorMessage.toLowerCase().includes("permission denied") ||
      errorMessage.toLowerCase().includes("database connection") ||
      errorMessage.toLowerCase().includes("authentication failed");

    if (isDatabaseError) {
      throw new HttpError(
        "Database connection error. Please check your database configuration and permissions.",
        503,
      );
    }

    throw new Error(ErrorMessages.YEARS_OF_EXPERIENCE_NOT_FOUND);
  }
};

export default getYearsOfExperience;
