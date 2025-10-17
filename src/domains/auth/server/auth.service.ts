import { signOtpToken, signPasswordToken } from "@/lib/jwt";
import emailService from "@/server/services/email.service";
import ErrorMessages from "@/constants/ErrorMessages";
import jwt from "jsonwebtoken";
import { ENV } from "@/constants/variables";

class AuthService {
  async sendOtp(email: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const token = signOtpToken({ email, otp }, "5m");

    await emailService.sendEmail(
      "Welcome to Our Platform!",
      "otp.html",
      {
        otp: otp,
      },
      email
    );

    return { token };
  }

  async verifyOtp(otp: string, email: string, token: string) {
    try {
      if (!token) {
        return { success: false, message: ErrorMessages.NO_OTP_TOKEN_FOUND };
      }
      if (!ENV.JWT_OTP_SECRET) {
        throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
      }

      // Verify JWT
      const decoded = jwt.verify(token, ENV.JWT_OTP_SECRET) as {
        email: string;
        otp: string;
      };

      // Compare OTP
      if (decoded.otp !== otp) {
        return { success: false, message: ErrorMessages.INVALID_OTP };
      }

      if (decoded.email !== email) {
        return { success: false, message: ErrorMessages.EMAIL_MISMATCH };
      }

      // Create password token with email
      const passwordToken = signPasswordToken({ email });

      return { success: true, email: decoded.email, passwordToken };
    } catch (err) {
      console.error("OTP verification error:", err);
      return { success: false, message: ErrorMessages.OTP_VERIFICATION_FAILED };
    }
  }
}

export default new AuthService();
