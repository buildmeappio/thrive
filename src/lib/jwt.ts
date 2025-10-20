import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";

const getJwtSecret = (
  name:
    | "JWT_OTP_SECRET"
    | "JWT_SET_PASSWORD_SECRET"
    | "JWT_EXAMINER_INFO_REQUEST_SECRET"
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
