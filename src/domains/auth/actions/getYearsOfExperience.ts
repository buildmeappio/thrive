"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

const getYearsOfExperience = async () => {
  try {
    const years = await authHandlers.getYearsOfExperience();
    return years;
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.YEARS_OF_EXPERIENCE_NOT_FOUND);
  }
};

export default getYearsOfExperience;
