'use server';

import { signPasswordToken } from '@/lib/jwt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;

type VerifyOtpResult = {
  success: boolean;
  email?: string;
  message?: string;
};

export async function verifyOtp(otp: string, email: string): Promise<VerifyOtpResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('otp_token')?.value;

    if (!token) {
      return { success: false, message: 'No OTP token found' };
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; otp: string };

    // Compare OTP
    if (decoded.otp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    if (decoded.email !== email) {
      return { success: false, message: 'Email mismatch' };
    }

    // Create password token with email
    const passwordToken = signPasswordToken({ email });

    cookieStore.set('password_token', passwordToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 15,
    });

    return { success: true, email: decoded.email };
  } catch (err) {
    console.error('OTP verification error:', err);
    return { success: false, message: 'OTP verification failed' };
  }
}
