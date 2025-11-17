import { 
  verifyPasswordToken, 
  signPasswordToken,
  signForgotPasswordToken,
  verifyForgotPasswordToken
} from "@/lib/jwt";
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
      // If it's already an HttpError, re-throw it
      if (error instanceof HttpError) {
        throw error;
      }

      // For any other error (like JWT verification failure), throw unauthorized
      throw HttpError.unauthorized(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
    }
  }

  generatePasswordToken(payload: {
    email: string;
    id: string;
    accountId: string;
    role: string;
    examinerId?: string;
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

  generateForgotPasswordToken(payload: {
    email: string;
    id: string;
    accountId: string;
    role: string;
  }): string {
    try {
      return signForgotPasswordToken(payload);
    } catch (error) {
      throw HttpError.fromError(
        error,
        ErrorMessages.FAILED_TOKEN_GENERATION,
        500
      );
    }
  }

  verifyForgotPasswordToken(token: string): JwtPayload {
    try {
      const decoded = verifyForgotPasswordToken(token);

      if (!decoded) {
        throw HttpError.unauthorized(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
      }

      return decoded;
    } catch (error) {
      // If it's already an HttpError, re-throw it
      if (error instanceof HttpError) {
        throw error;
      }

      // For any other error (like JWT verification failure), throw unauthorized
      throw HttpError.unauthorized(ErrorMessages.INVALID_OR_EXPIRED_TOKEN);
    }
  }

  extractUserFromToken(token: string) {
    const decoded = this.verifyToken(token);

    return {
      userId: decoded.id as string,
      email: decoded.email as string,
      accountId: decoded.accountId as string,
      role: decoded.role as string,
      examinerId: decoded.examinerId as string | undefined,
    };
  }

  extractUserFromForgotPasswordToken(token: string) {
    const decoded = this.verifyForgotPasswordToken(token);

    return {
      userId: decoded.id as string,
      email: decoded.email as string,
      accountId: decoded.accountId as string,
      role: decoded.role as string,
    };
  }
}

export default new TokenService();
