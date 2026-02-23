"use server";

import saveAvailability, {
  type SaveAvailabilityInput,
} from "../handlers/saveAvailability";

export const saveAvailabilityAction = async (input: SaveAvailabilityInput) => {
  try {
    const result = await saveAvailability(input);
    return result;
  } catch (error: unknown) {
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to save availability",
    };
  }
};
