"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import { listCustomVariables } from "../server/customVariable.service";
import { listCustomVariablesSchema } from "../schemas/customVariable.schema";
import type {
  ActionResult,
  CustomVariable,
} from "../types/customVariable.types";

export const listCustomVariablesAction = async (
  input: unknown = {},
): Promise<ActionResult<CustomVariable[]>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = listCustomVariablesSchema.parse(input);
    const data = await listCustomVariables(parsed);

    return { success: true, data };
  } catch (error) {
    console.error("Error listing custom variables:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to list custom variables" };
  }
};
