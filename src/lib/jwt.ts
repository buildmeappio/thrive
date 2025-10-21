import ErrorMessages from '@/constants/ErrorMessages';
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

const getJwtSecret = (name: 'otp' | 'password') => {
  let secret: string | null = null;
  if (name === 'otp') {
    secret = process.env.JWT_OTP_SECRET as string;
  } else {
    secret = process.env.JWT_SET_PASSWORD_SECRET as string;
  }
  if (!secret) {
    throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
  }
  return secret;
};

// ----- OTP Tokens -----
export function signOtpToken(payload: object, expiresIn: SignOptions['expiresIn'] = '5m'): string {
  const otpSecret = getJwtSecret('otp');
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, otpSecret, options);
}

export function verifyOtpToken(token: string): JwtPayload | null {
  const otpSecret = getJwtSecret('otp');
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
  const passwordSecret = getJwtSecret('password');
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, passwordSecret, options);
}

export function verifyPasswordToken(token: string): JwtPayload | null {
  try {
    const passwordSecret = getJwtSecret('password');
    return jwt.verify(token, passwordSecret) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Reset Password Tokens -----
export function signResetPasswordToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '24h'
): string {
  const passwordSecret = getJwtSecret('password');
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, passwordSecret, options);
}

export function verifyResetPasswordToken(token: string): JwtPayload | null {
  try {
    const passwordSecret = getJwtSecret('password');
    return jwt.verify(token, passwordSecret) as JwtPayload;
  } catch {
    return null;
  }
}
