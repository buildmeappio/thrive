"use server";

import authHandlers from "../server/handlers";
import ErrorMessages from "@/constants/ErrorMessages";

// Function to check if a string is a UUID (version agnostic)
function isUuid(str: string): boolean {
  // Matches both uuid v4 and v1, v3, v5 (with or without hyphens)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

const getLanguages = async () => {
  try {
    const languages = await authHandlers.getLanguages();
    // Only include languages where the name is NOT a uuid
    return languages.filter(
      (lang: { name: string; [key: string]: unknown }) =>
        lang.name && !isUuid(lang.name),
    );
  } catch (error) {
    console.error(error);
    throw new Error(ErrorMessages.LANGUAGES_NOT_FOUND);
  }
};

export default getLanguages;
