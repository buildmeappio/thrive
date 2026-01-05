"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { updateContractFields } from "../server/contract.service";
import {
  ActionResult,
  UpdateContractFieldsInput,
} from "../types/contract.types";

export const updateContractFieldsAction = async (
  input: UpdateContractFieldsInput,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await updateContractFields(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating contract fields:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update contract fields",
    };
  }
};
