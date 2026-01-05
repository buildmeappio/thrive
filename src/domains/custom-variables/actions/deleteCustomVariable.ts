"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { deleteCustomVariable } from "../server/customVariable.service";
import { z } from "zod";
import type { ActionResult } from "../types/customVariable.types";

const deleteCustomVariableSchema = z.object({
  id: z.string().uuid(),
});

export const deleteCustomVariableAction = async (
  input: unknown,
): Promise<ActionResult<void>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = deleteCustomVariableSchema.parse(input);
    await deleteCustomVariable(parsed.id);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting custom variable:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete custom variable" };
  }
};
