"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { createFeeVariable } from "../server/feeStructure.service";
import { createFeeVariableSchema } from "../schemas/feeStructure.schema";
import {
  ActionResult,
  CreateFeeVariableInput,
} from "../types/feeStructure.types";

export const createFeeVariableAction = async (
  input: CreateFeeVariableInput,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = createFeeVariableSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors[key] = value[0];
        }
      }
      // Also check for form errors from refinements
      const formErrors = parsed.error.flatten().formErrors;
      if (formErrors.length > 0) {
        return {
          success: false,
          error: formErrors[0],
          fieldErrors,
        };
      }
      return {
        success: false,
        error: "Validation failed",
        fieldErrors,
      };
    }

    const data = await createFeeVariable(parsed.data);

    revalidatePath("/dashboard/fee-structures");
    revalidatePath(`/dashboard/fee-structures/${input.feeStructureId}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error creating fee variable:", error);

    // Check for validation errors with fieldErrors
    const errorWithFields = error as Error & {
      fieldErrors?: Record<string, string>;
    };
    if (errorWithFields.fieldErrors) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Validation failed",
        fieldErrors: errorWithFields.fieldErrors,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create variable",
    };
  }
};
