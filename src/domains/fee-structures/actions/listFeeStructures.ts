"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { listFeeStructures } from "../server/feeStructure.service";
import { listFeeStructuresSchema } from "../schemas/feeStructure.schema";
import {
  ActionResult,
  FeeStructureListItem,
  ListFeeStructuresInput,
} from "../types/feeStructure.types";

export const listFeeStructuresAction = async (
  input: ListFeeStructuresInput,
): Promise<ActionResult<FeeStructureListItem[]>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsed = listFeeStructuresSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string
        >,
      };
    }

    const data = await listFeeStructures(parsed.data);
    return { success: true, data };
  } catch (error) {
    console.error("Error listing fee structures:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to list fee structures",
    };
  }
};
