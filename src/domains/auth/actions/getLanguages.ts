"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

const getLanguages = async () => {
  try {
    const languages = await authHandlers.getLanguages();
    return languages;
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.LANGUAGES_NOT_FOUND);
  }
};

export default getLanguages;
