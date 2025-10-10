import { verifyPasswordToken, signPasswordToken } from "@/lib/jwt";
import HttpError from "@/utils/httpError";
import { JwtPayload } from "jsonwebtoken";
import ErrorMessages from "@/constants/ErrorMessages";

class TokenService {
  verifyToken(token: string): JwtPayload {
    try {
      const decoded = verifyPasswordToken(token);

      if (!decoded) {
        throw HttpError.unauthorized(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
      }

      return decoded;
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_TOKEN_VERIFICATION,
        401
      );
    }
  }

  generatePasswordToken(payload: {
    email: string;
    id: string;
    accountId: string;
    role: string;
  }): string {
    try {
      return signPasswordToken(payload);
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_TOKEN_GENERATION,
        500
      );
    }
  }

  extractUserFromToken(token: string) {
    const decoded = this.verifyToken(token);

    return {
      userId: decoded.id as string,
      email: decoded.email as string,
      accountId: decoded.accountId as string,
      role: decoded.role as string,
    };
  }
}

export default new TokenService();
