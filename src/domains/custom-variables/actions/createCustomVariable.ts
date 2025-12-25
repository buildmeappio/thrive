"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { createCustomVariable } from "../server/customVariable.service";
import { createCustomVariableSchema } from "../schemas/customVariable.schema";
import type {
  ActionResult,
  CustomVariable,
} from "../types/customVariable.types";

export const createCustomVariableAction = async (
  input: unknown,
): Promise<ActionResult<CustomVariable>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = createCustomVariableSchema.parse(input);
    const data = await createCustomVariable(parsed);
    return { success: true, data };
  } catch (error) {
    console.error("Error creating custom variable:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create custom variable" };
  }
};
