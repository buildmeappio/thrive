'use server';

import { cookies } from 'next/headers';
import authService from '../auth.service';
import env from '@/config/env';

const sendOtp = async (email: string) => {
  const token = await authService.sendOtp(email);
  const cookieStore = await cookies();
  cookieStore.set('otp_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
  });
};

export default sendOtp;
