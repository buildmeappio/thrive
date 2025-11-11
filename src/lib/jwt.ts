import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";

const getJwtSecret = (
  name:
    | "JWT_OTP_SECRET"
    | "JWT_SET_PASSWORD_SECRET"
    | "JWT_EXAMINER_INFO_REQUEST_SECRET"
    | "JWT_CLAIMANT_APPROVE_SECRET"
) => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`${name} secret must be defined in environment variables`);
  }
  return secret as string;
};

export function signOtpToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "5m"
): string {
  const options: SignOptions = { expiresIn };
  const JWT_OTP_SECRET = getJwtSecret("JWT_OTP_SECRET");
  return jwt.sign(payload, JWT_OTP_SECRET, options);
}

export function verifyOtpToken(token: string): JwtPayload | null {
  try {
    const JWT_OTP_SECRET = getJwtSecret("JWT_OTP_SECRET");
    return jwt.verify(token, JWT_OTP_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Password Tokens -----
export function signPasswordToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  const options: SignOptions = { expiresIn };
  const JWT_SET_PASSWORD_SECRET = getJwtSecret("JWT_SET_PASSWORD_SECRET");
  return jwt.sign(payload, JWT_SET_PASSWORD_SECRET, options);
}

export function verifyPasswordToken(token: string): JwtPayload | null {
  try {
    const JWT_SET_PASSWORD_SECRET = getJwtSecret("JWT_SET_PASSWORD_SECRET");
    return jwt.verify(token, JWT_SET_PASSWORD_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Examiner Info Tokens -----
export function signExaminerInfoToken(
  payload: {
    email: string;
    userId: string;
    accountId: string;
    examinerId: string;
  },
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  const options: SignOptions = { expiresIn };
  const JWT_EXAMINER_INFO_REQUEST_SECRET = getJwtSecret(
    "JWT_EXAMINER_INFO_REQUEST_SECRET"
  );
  return jwt.sign(payload, JWT_EXAMINER_INFO_REQUEST_SECRET, options);
}

export function verifyExaminerInfoToken(token: string): JwtPayload | null {
  try {
    const JWT_EXAMINER_INFO_REQUEST_SECRET = getJwtSecret(
      "JWT_EXAMINER_INFO_REQUEST_SECRET"
    );
    return jwt.verify(token, JWT_EXAMINER_INFO_REQUEST_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ----- Claimant Approve Tokens -----
export function signClaimantApproveToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "30d"
): string {
  const options: SignOptions = { expiresIn };
  const JWT_CLAIMANT_APPROVE_SECRET = getJwtSecret(
    "JWT_CLAIMANT_APPROVE_SECRET"
  );
  return jwt.sign(payload, JWT_CLAIMANT_APPROVE_SECRET, options);
}

/**
 * Verify and decode a claimant approval token (uses JWT_CLAIMANT_APPROVE_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyClaimantApproveToken(
  token: string
): string | jwt.JwtPayload {
  try {
    const JWT_CLAIMANT_APPROVE_SECRET = getJwtSecret(
      "JWT_CLAIMANT_APPROVE_SECRET"
    );
    return jwt.verify(token, JWT_CLAIMANT_APPROVE_SECRET);
  } catch {
    throw new Error("Invalid or expired claimant approval token");
  }
}
