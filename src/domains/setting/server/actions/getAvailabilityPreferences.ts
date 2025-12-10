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
  } catch (error: unknown) {
    return {
      success: false as const,
      data: null,
      message: (error instanceof Error ? error.message : undefined) || "Failed to fetch availability preferences",
    };
  }
};
