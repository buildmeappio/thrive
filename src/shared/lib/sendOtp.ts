'use server';

import { cookies } from 'next/headers';
import { signOtpToken } from '@/lib/jwt';
import emailService from '@/shared/lib/emailService';

export async function sendOtp(email: string) {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const token = signOtpToken({ email, otp }, '5m');

  const cookieStore = await cookies();
  cookieStore.set('otp_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 300,
  });

  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log(otp)
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")
  console.log("--------------------------")

  await emailService.sendEmail(
    'Welcome to Our Platform!',
    'otp.html',
    {
      otp: otp,
    },
    email
  );

  return { success: true };
}
