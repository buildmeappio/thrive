"use server";

import { z } from "zod";
import userService from "../server/user.service";
import { UserTableRow } from "../types/UserData";
import logger from "@/utils/logger";
import { AccountStatus } from "@thrive/database";

// Helper function to check if name contains at least one letter
const hasAtLeastOneLetter = (value: string): boolean => {
  return /[a-zA-Z]/.test(value.trim());
};

const schema = z.object({
  id: z.string().uuid(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .trim()
    .refine(
      (val) => val.length >= 2,
      "First name must be at least 2 characters",
    )
    .refine(
      (val) => /^[a-zA-Z\s'-]+$/.test(val),
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "First name must contain at least one letter",
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .trim()
    .refine((val) => val.length >= 2, "Last name must be at least 2 characters")
    .refine(
      (val) => /^[a-zA-Z\s'-]+$/.test(val),
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine(
      (val) => hasAtLeastOneLetter(val),
      "Last name must contain at least one letter",
    ),
  email: z.string().email("Invalid email"),
});

type UpdateUserInput = z.infer<typeof schema>;

export const updateUser = async (
  rawInput: UpdateUserInput,
): Promise<{ success: boolean; user?: UserTableRow; error?: string }> => {
  try {
    const input = schema.parse(rawInput);
    const updated = await userService.updateUser(input);
    const account = updated.accounts[0];
    return {
      success: true,
      user: {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        gender: updated.gender,
        role: account?.role?.name || "N/A",
        isActive: account?.status === AccountStatus.ACTIVE,
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
