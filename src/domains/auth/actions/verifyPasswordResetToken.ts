"use server";

import { verifyPasswordResetToken } from "../server/handlers/verifyPasswordResetToken";

const verifyPasswordResetTokenAction = async (token: string) => {
  try {
    await verifyPasswordResetToken(token);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
};

export default verifyPasswordResetTokenAction;

