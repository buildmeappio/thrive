"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { deleteContractTemplate } from "../server/contractTemplate.service";
import { ActionResult } from "../types/contractTemplate.types";

export const deleteContractTemplateAction = async (
  id: string,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid contract template ID" };
    }

    const data = await deleteContractTemplate(id);

    revalidatePath("/dashboard/contract-templates");
    revalidatePath(`/dashboard/contract-templates/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting contract template:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete contract template",
    };
  }
};
