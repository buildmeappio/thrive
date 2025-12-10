"use server";

import { VerifyResumeTokenInput } from "../server/handlers/verifyResumeToken";
import authHandlers from "../server/handlers/index";

const verifyResumeToken = async (payload: VerifyResumeTokenInput) => {
  try {
    const result = await authHandlers.verifyResumeToken(payload);
    return result;
  } catch (error: unknown) {
    console.error("Error in verifyResumeToken action:", error);
    return {
      success: false,
      message:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to verify resume token. The link may be invalid or expired.",
    };
  }
};

export default verifyResumeToken;

