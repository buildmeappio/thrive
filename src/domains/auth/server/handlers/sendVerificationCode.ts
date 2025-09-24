// domains/auth/server/handlers/sendVerificationCode.ts
import { SendVerificationCodeInput } from "../../types";
import authService from "../auth.service";

const sendVerificationCode = async (payload: SendVerificationCodeInput) => {
  const { code, expiresAt } = await authService.sendVerificationCode(payload);
  // Do not return code in production responses. Expose only expiry.
  return {
    success: true,
    ...(process.env.NODE_ENV === "development" ? { code } : {}),
    expiresAt,
  };
};

export default sendVerificationCode;
