'use server';

import { cookies } from 'next/headers';
import authService from '../auth.service';

const sendOtp = async (email: string) => {
  const token = await authService.sendOtp(email);
  const cookieStore = await cookies();
  cookieStore.set('otp_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
  });
};

export default sendOtp;
