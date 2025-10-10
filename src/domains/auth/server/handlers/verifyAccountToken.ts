import { userService, tokenService } from "../services";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

export type VerifyAccountTokenInput = {
  token: string;
};

const verifyAccountToken = async (payload: VerifyAccountTokenInput) => {
  try {
    // Verify token and extract user data
    const { userId } = tokenService.extractUserFromToken(payload.token);

    // Check if user exists
    const user = await userService.getUserById(userId);

    return {
      success: true,
      data: {
        user,
        isValid: true,
      },
    };
  } catch (error) {
    throw HttpError.fromError(
      error,
      ErrorMessages.FAILED_TOKEN_VERIFICATION,
      401
    );
  }
};

export default verifyAccountToken;
