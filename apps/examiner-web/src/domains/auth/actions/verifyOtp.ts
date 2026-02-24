'use server';
import authHandlers from '../server/handlers/index';

const verifyOtp = async (otp: string, email: string) => {
  const result = await authHandlers.verifyOtp(otp, email);
  return result;
};

export default verifyOtp;
