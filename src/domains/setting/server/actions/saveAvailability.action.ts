"use server";

import saveAvailability, {
  type SaveAvailabilityInput,
} from "../handlers/saveAvailability";

export const saveAvailabilityAction = async (input: SaveAvailabilityInput) => {
  try {
    const result = await saveAvailability(input);
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to save availability",
    };
  }
};
