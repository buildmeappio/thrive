"use server";

import { verifyAccountToken } from "@/lib/jwt";
import { JwtPayload } from "jsonwebtoken";
import prisma from "@/lib/db";
import logger from "@/utils/logger";

type PasswordResetTokenPayload = {
  email: string;
  id: string;
  userId: string;
  accountId: string;
  adminId: string;
  role: string;
  purpose: string;
  isUsed?: boolean;
};

export const verifyPasswordResetToken = async (
  token: string,
): Promise<PasswordResetTokenPayload> => {
  try {
    const decoded = verifyAccountToken(token);

    // If decoded is a string, throw error
    if (typeof decoded === "string") {
      throw new Error("Invalid token format");
    }

    const payload = decoded as JwtPayload;

    // Verify it's a password reset token
    if (payload.purpose !== "password-reset") {
      throw new Error("Invalid token purpose");
    }

    // Validate required fields
    if (
      !payload.email ||
      !payload.userId ||
      !payload.accountId ||
      !payload.role
    ) {
      throw new Error("Missing required token fields");
    }

    // Check if token has been used by comparing updatedAt timestamp
    if (payload.updatedAt) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { updatedAt: true },
      });

      if (user) {
        const tokenIssuedAt = payload.updatedAt;
        const userLastUpdated = user.updatedAt.getTime();

        // If user was updated after token was issued, the token has been used
        if (userLastUpdated > tokenIssuedAt) {
          throw new Error("This password reset link has already been used");
        }
      }
    }

    return {
      email: payload.email,
      id: payload.id || payload.userId,
      userId: payload.userId,
      accountId: payload.accountId,
      adminId: payload.adminId || payload.accountId,
      role: payload.role,
      purpose: payload.purpose,
    };
  } catch (error) {
    logger.error("Error verifying password reset token:", error);

    // Preserve the specific error message
    if (
      error instanceof Error &&
      error.message === "This password reset link has already been used"
    ) {
      throw error;
    }

    throw new Error("Invalid or expired password reset token");
  }
};
