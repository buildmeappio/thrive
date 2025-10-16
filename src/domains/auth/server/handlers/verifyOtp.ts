'use server';

import { cookies } from 'next/headers';
import authService from '../auth.service';

type VerifyOtpResult = {
  email: string;
  passwordToken: string;
};

const verifyOtp = async (otp: string, email: string): Promise<VerifyOtpResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('otp_token')?.value;

  const result = await authService.verifyOtp(otp, email, token || '');

  cookieStore.set('password_token', result.passwordToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15,
  });

  return result;
};
export default verifyOtp;
