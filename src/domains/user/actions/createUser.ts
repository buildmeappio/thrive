"use server";

import { z } from "zod";
import userService from "../server/user.service";
import { UserTableRow } from "../types/UserData";
import logger from "@/utils/logger";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUser = async (
  rawInput: CreateUserInput,
): Promise<{ success: boolean; user?: UserTableRow; error?: string }> => {
  try {
    const input = createUserSchema.parse(rawInput);
    const user = await userService.createAdminUser(input);
    return {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        role: user.accounts[0]?.role?.name || "N/A",
        isLoginEnabled: user.isLoginEnabled,
        mustResetPassword: user.mustResetPassword,
        createdAt: user.createdAt.toISOString(),
      },
    };
  } catch (error) {
    logger.error("Create user failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
};

export default createUser;
