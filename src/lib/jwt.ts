import ErrorMessages from '@/constants/ErrorMessages';
import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken';

if (!process.env.JWT_SECRET || !process.env.PASSWORD_JWT_SECRET) {
  throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
}

const otpSecret: Secret = process.env.JWT_SECRET;
const passwordSecret: Secret = process.env.PASSWORD_JWT_SECRET;

// ----- OTP Tokens -----
export function signOtpToken(payload: object, expiresIn: SignOptions['expiresIn'] = '5m'): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, otpSecret, options);
}

export function verifyOtpToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, otpSecret) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Password Tokens -----
export function signPasswordToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '15m'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, passwordSecret, options);
}

export function verifyPasswordToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, passwordSecret) as JwtPayload;
  } catch {
    return null;
  }
}
