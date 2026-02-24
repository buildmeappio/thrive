"use server";

import { RoleType } from "@/domains/auth/constants/roles";
import userService from "../server/user.service";
import logger from "@/utils/logger";
import { AccountStatus } from "@thrive/database";

type ToggleUserStatusInput = {
  userId: string;
  role: RoleType;
  isActive: boolean;
};

export const toggleUserStatus = async (
  data: ToggleUserStatusInput,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await userService.toggleUserStatus(
      data.userId,
      data.role,
      data.isActive ? AccountStatus.ACTIVE : AccountStatus.INACTIVE,
    );
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
