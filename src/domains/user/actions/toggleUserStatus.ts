"use server";

import userService from "../server/user.service";
import logger from "@/utils/logger";

type ToggleUserStatusInput = {
  userId: string;
  isLoginEnabled: boolean;
};

export const toggleUserStatus = async (
  data: ToggleUserStatusInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    await userService.toggleUserStatus(data.userId, data.isLoginEnabled);
    return { success: true };
  } catch (error) {
    logger.error("Toggle user status failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user status",
    };
  }
};

export default toggleUserStatus;

