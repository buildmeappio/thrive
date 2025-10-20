"use server";

import getSpecialtyPreferencesHandler from "../handlers/getSpecialtyPreferences";

export const getSpecialtyPreferencesAction = async (accountId: string) => {
  try {
    return await getSpecialtyPreferencesHandler({ accountId });
  } catch (error: any) {
    return {
      success: false as const,
      data: null,
      message: error.message || "Failed to fetch specialty preferences",
    };
  }
};
