"use server";

import getAvailability, {
  type GetAvailabilityInput,
} from "../handlers/getAvailability";

export const getAvailabilityAction = async (input: GetAvailabilityInput) => {
  try {
    const result = await getAvailability(input);
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message: error.message || "Failed to fetch availability",
    };
  }
};
