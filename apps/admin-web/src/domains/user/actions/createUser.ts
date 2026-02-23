"use server";

import { z } from "zod";
import userService from "../server/user.service";
import { UserTableRow } from "../types/UserData";
import logger from "@/utils/logger";
import { AccountStatus } from "@prisma/client";

// Helper function to check if name contains at least one letter
const hasAtLeastOneLetter = (value: string): boolean => {
  return /[a-zA-Z]/.test(value.trim());
};

const createUserSchema = z.object({
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
  email: z.string().email("Invalid email address"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUser = async (
  rawInput: CreateUserInput,
): Promise<{ success: boolean; user?: UserTableRow; error?: string }> => {
  try {
    const input = createUserSchema.parse(rawInput);
    const user = await userService.createAdminUser(input);
    const account = user.accounts[0];
    return {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        role: account?.role?.name || "N/A",
        isActive: account?.status === AccountStatus.ACTIVE,
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
