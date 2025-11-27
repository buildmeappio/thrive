"use server";

import { z } from "zod";
import authHandlers from "@/domains/auth/server/handlers";

const schema = z.object({
  email: z.string().email(),
});

type RequestPasswordResetInput = z.infer<typeof schema>;

export const requestPasswordReset = async (
  rawInput: RequestPasswordResetInput
): Promise<{ success: boolean; error?: string }> => {
  try {
    const input = schema.parse(rawInput);
    await authHandlers.forgotPassword({ email: input.email });
    return { success: true };
  } catch (error) {
    console.error("Password reset link failed:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send password reset link",
    };
  }
};

export default requestPasswordReset;

