"use server";

import { revalidatePath } from "next/cache";
import { FeeStructureStatus } from "@thrive/database";
import { getCurrentUser } from "@/domains/auth/server/session";
import { activateFeeStructure } from "../server/feeStructure.service";
import { ActionResult } from "../types/feeStructure.types";

export const activateFeeStructureAction = async (
  id: string,
): Promise<ActionResult<{ id: string; status: FeeStructureStatus }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid fee structure ID" };
    }

    const data = await activateFeeStructure(id);

    revalidatePath("/dashboard/fee-structures");
    revalidatePath(`/dashboard/fee-structures/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error activating fee structure:", error);

    // Check for validation errors with fieldErrors
    const errorWithFields = error as Error & {
      fieldErrors?: Record<string, string>;
    };
    if (errorWithFields.fieldErrors) {
      return {
        success: false,
        error: "Validation failed. Please fix the errors before activating.",
        fieldErrors: errorWithFields.fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to activate fee structure",
    };
  }
};
