'use server';
import authHandlers from "../server/handlers/index";

const resendOtp = async (email: string) => {
  const result = await authHandlers.sendOtp(email);
  return result;
};

export default resendOtp;
