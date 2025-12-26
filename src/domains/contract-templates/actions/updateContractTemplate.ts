"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { updateContractTemplate } from "../server/contractTemplate.service";
import {
  ActionResult,
  UpdateContractTemplateInput,
} from "../types/contractTemplate.types";

export const updateContractTemplateAction = async (
  input: UpdateContractTemplateInput,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await updateContractTemplate(input);
    return { success: true, data };
  } catch (error) {
    console.error("Error updating contract template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update contract template",
    };
  }
};
