import { VerifyCodeInput } from "../../types";
import authService from "../auth.service";

const verifyCode = async (payload: VerifyCodeInput) => {
  const res = await authService.verifyCode(payload);
  return { success: res.isVerified === true };
};

export default verifyCode;
