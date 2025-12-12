"use server";

import saveAvailability, {
  type SaveAvailabilityInput,
} from "../server/handlers/saveAvailability";

export const saveInterpreterAvailabilityAction = async (
  input: SaveAvailabilityInput,
) => {
  try {
    const result = await saveAvailability(input);
    return result;
  } catch (error: any) {
    return {
      success: false as const,
      message: error.message || "Failed to save availability",
    };
  }
};
