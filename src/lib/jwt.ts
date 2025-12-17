import ErrorMessages from '@/constants/ErrorMessages';
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';
import env from '@/config/env';

const jwtConfig = {
  otp: env.JWT_OTP_TOKEN_SECRET,
  password: env.JWT_FORGET_PASSWORD_TOKEN_SECRET,
  claimant_approve: env.JWT_CLAIMANT_APPROVE_TOKEN_SECRET,
  org_info_request: env.JWT_ORGANIZATION_INFO_REQUEST_TOKEN_SECRET,
} as const;

const getJwtSecret = (name: keyof typeof jwtConfig) => {
  const secret = jwtConfig[name];
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
  expiresIn: SignOptions['expiresIn'] = env.JWT_FORGET_PASSWORD_TOKEN_EXPIRY as SignOptions['expiresIn']
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
  expiresIn: SignOptions['expiresIn'] = env.JWT_FORGET_PASSWORD_TOKEN_EXPIRY as SignOptions['expiresIn']
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

// ----- Claimant Approval Tokens -----
export function signClaimantApprovalToken(
  payload: { email: string; caseId: string; examinationId: string },
  expiresIn: SignOptions['expiresIn'] = env.JWT_CLAIMANT_APPROVE_TOKEN_EXPIRY as SignOptions['expiresIn']
): string {
  const claimantSecret = getJwtSecret('claimant_approve');
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, claimantSecret, options);
}

export function verifyClaimantApprovalToken(token: string): JwtPayload | null {
  try {
    const claimantSecret = getJwtSecret('claimant_approve');
    return jwt.verify(token, claimantSecret) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Organization Info Request Tokens -----
export function signOrgInfoRequestToken(
  payload: { email: string; organizationId: string },
  expiresIn: SignOptions['expiresIn'] = env.JWT_ORGANIZATION_INFO_REQUEST_TOKEN_EXPIRY as SignOptions['expiresIn']
): string {
  const orgInfoRequestSecret = getJwtSecret('org_info_request');
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, orgInfoRequestSecret, options);
}

export function verifyOrgInfoRequestToken(token: string): JwtPayload | null {
  try {
    const orgInfoRequestSecret = getJwtSecret('org_info_request');
    return jwt.verify(token, orgInfoRequestSecret) as JwtPayload;
  } catch {
    return null;
  }
}
