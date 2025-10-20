"use server";

import updateSpecialtyPreferencesHandler from "../handlers/updateSpecialtyPreferences";

export const updateSpecialtyPreferencesAction = async (data: {
  examinerProfileId: string;
  specialty: string[];
  assessmentTypes: string[];
  preferredFormat: string;
  regionsServed: string[];
  languagesSpoken: string[];
  activationStep?: string;
}) => {
  try {
    return await updateSpecialtyPreferencesHandler(data);
  } catch (error: any) {
    return {
      success: false as const,
      data: null,
      message: error.message || "Failed to update specialty preferences",
    };
  }
};
