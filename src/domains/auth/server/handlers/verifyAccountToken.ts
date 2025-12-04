import { userService, tokenService } from "../services";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";
import { log, error } from "@/utils/logger";

export type VerifyAccountTokenInput = {
  token: string;
};

const verifyAccountToken = async (payload: VerifyAccountTokenInput) => {
  try {
    log("Verifying token:", payload.token);

    // Verify token and extract user data
    const { userId, accountId } = tokenService.extractUserFromToken(
      payload.token
    );
    log("Extracted userId:", userId);

    // Check if user exists
    const user = await userService.getUserById(userId);
    log("User found:", !!user);
    log("User password field:", user.password);
    log("User password exists:", !!user.password);
    log("User password type:", typeof user.password);
    log("User password length:", user.password?.length);
    log("User password starts with $2b$:", user.password?.startsWith("$2b$"));
    log("Full user object:", JSON.stringify(user, null, 2));

    // Check if user already has a password set (token already used)
    // A valid bcrypt hash starts with $2b$ and is typically 60 characters long
    const isValidPasswordHash =
      user.password &&
      user.password.startsWith("$2b$") &&
      user.password.length >= 60;

    if (isValidPasswordHash) {
      log("User already has password set - token already used");
      throw HttpError.unauthorized(
        "Token has already been used. Please log in with your existing password."
      );
    }

    return {
      success: true,
      data: {
        user: {
          ...user,
          accountId,
        },
        isValid: true,
      },
    };
  } catch (err) {
    error("Token verification error:", err);
    throw HttpError.fromError(
      err,
      ErrorMessages.FAILED_TOKEN_VERIFICATION,
      401
    );
  }
};

export default verifyAccountToken;
