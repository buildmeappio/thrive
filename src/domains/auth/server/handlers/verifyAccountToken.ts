import { userService, tokenService } from "../services";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type VerifyAccountTokenInput = {
  token: string;
};

const verifyAccountToken = async (payload: VerifyAccountTokenInput) => {
  try {
    console.log("Verifying token:", payload.token);

    // Verify token and extract user data
    const { userId } = tokenService.extractUserFromToken(payload.token);
    console.log("Extracted userId:", userId);

    // Check if user exists
    const user = await userService.getUserById(userId);
    console.log("User found:", !!user);
    console.log("User password field:", user.password);
    console.log("User password exists:", !!user.password);
    console.log("User password type:", typeof user.password);
    console.log("User password length:", user.password?.length);
    console.log(
      "User password starts with $2b$:",
      user.password?.startsWith("$2b$")
    );
    console.log("Full user object:", JSON.stringify(user, null, 2));

    // Check if user already has a password set (token already used)
    // A valid bcrypt hash starts with $2b$ and is typically 60 characters long
    const isValidPasswordHash =
      user.password &&
      user.password.startsWith("$2b$") &&
      user.password.length >= 60;

    if (isValidPasswordHash) {
      console.log("User already has password set - token already used");
      throw HttpError.unauthorized(
        "Token has already been used. Please log in with your existing password."
      );
    }

    return {
      success: true,
      data: {
        user,
        isValid: true,
      },
    };
  } catch (error) {
    console.log("Token verification error:", error);
    throw HttpError.fromError(
      error,
      ErrorMessages.FAILED_TOKEN_VERIFICATION,
      401
    );
  }
};

export default verifyAccountToken;
