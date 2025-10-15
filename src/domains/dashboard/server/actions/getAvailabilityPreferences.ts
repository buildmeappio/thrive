"use server";

// TODO: Implement handler
// import getAvailabilityPreferencesHandler from "../handlers/getAvailabilityPreferences";

export const getAvailabilityPreferencesAction = async () => {
  try {
    // return await getAvailabilityPreferencesHandler({ accountId });
    return {
      success: false as const,
      data: null,
      message: "Not implemented yet",
    };
  } catch (error: any) {
    return {
      success: false as const,
      data: null,
      message: error.message || "Failed to fetch availability preferences",
    };
  }
};
