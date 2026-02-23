"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { deleteFeeVariable } from "../server/feeStructure.service";
import { deleteFeeVariableSchema } from "../schemas/feeStructure.schema";
import {
  ActionResult,
  DeleteFeeVariableInput,
} from "../types/feeStructure.types";

export const deleteFeeVariableAction = async (
  input: DeleteFeeVariableInput,
): Promise<ActionResult<{ success: boolean }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = deleteFeeVariableSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
      };
    }

    const data = await deleteFeeVariable(
      parsed.data.feeStructureId,
      parsed.data.variableId,
    );

    revalidatePath("/dashboard/fee-structures");
    revalidatePath(`/dashboard/fee-structures/${input.feeStructureId}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting fee variable:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete variable",
    };
  }
};
