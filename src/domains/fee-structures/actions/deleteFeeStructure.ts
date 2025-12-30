"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/domains/auth/server/session";
import { deleteFeeStructure } from "../server/feeStructure.service";
import { ActionResult } from "../types/feeStructure.types";

export const deleteFeeStructureAction = async (
  id: string,
): Promise<ActionResult<{ id: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid fee structure ID" };
    }

    const data = await deleteFeeStructure(id);

    revalidatePath("/dashboard/fee-structures");
    revalidatePath(`/dashboard/fee-structures/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting fee structure:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete fee structure",
    };
  }
};
