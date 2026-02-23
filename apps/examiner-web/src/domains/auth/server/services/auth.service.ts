import { compare } from "bcryptjs";
import HttpError from "@/utils/httpError";
import ErrorMessages from "@/constants/ErrorMessages";

class AuthService {
  async verifyPassword(plainPassword: string, hashedPassword: string) {
    try {
      const isMatch = await compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_PASSWORD_VERIFICATION,
        500,
      );
    }
  }

  validatePassword(password: string | null) {
    if (!password) {
      throw HttpError.unauthorized(ErrorMessages.INVALID_CREDENTIALS);
    }
  }
}

export default new AuthService();
