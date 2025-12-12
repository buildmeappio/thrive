"use server";

import { z } from "zod";
import userService from "../server/user.service";
import { UserTableRow } from "../types/UserData";
import logger from "@/utils/logger";

const schema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
});

type UpdateUserInput = z.infer<typeof schema>;

export const updateUser = async (
  rawInput: UpdateUserInput,
): Promise<{ success: boolean; user?: UserTableRow; error?: string }> => {
  try {
    const input = schema.parse(rawInput);
    const updated = await userService.updateUser(input);
    return {
      success: true,
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        gender: updated.gender,
        role: updated.accounts[0]?.role?.name || "N/A",
        isLoginEnabled: updated.isLoginEnabled,
        mustResetPassword: updated.mustResetPassword,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error("Update user failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
};

export default updateUser;
