"use server";

import { SaveApplicationProgressInput } from "../server/handlers/saveApplicationProgress";
import authHandlers from "../server/handlers/index";

const saveApplicationProgress = async (payload: SaveApplicationProgressInput) => {
  try {
    const result = await authHandlers.saveApplicationProgress(payload);
    return result;
  } catch (error: any) {
    console.error("Error in saveApplicationProgress action:", error);
    return {
      success: false,
      message:
        error?.message ||
        "Failed to save application progress. Please try again.",
    };
  }
};

export default saveApplicationProgress;

