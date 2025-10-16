import jwt, {
  type Secret,
  type SignOptions,
  type JwtPayload,
} from "jsonwebtoken";
import { ENV } from "@/constants/variables";

const checkJwtSecrets = () => {
  if (
    !ENV.JWT_OTP_SECRET ||
    !ENV.JWT_SET_PASSWORD_SECRET ||
    !ENV.JWT_EXAMINER_INFO_REQUEST_SECRET
  ) {
    throw new Error("JWT secrets are required");
  }

  return {
    otpSecret: ENV.JWT_OTP_SECRET as Secret,
    passwordSecret: ENV.JWT_SET_PASSWORD_SECRET as Secret,
    examinerRequestSecret: ENV.JWT_EXAMINER_INFO_REQUEST_SECRET as Secret,
  };
};

const { otpSecret, passwordSecret, examinerRequestSecret } = checkJwtSecrets();

export function signOtpToken(
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "5m"
): string {
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
  expiresIn: SignOptions["expiresIn"] = "7d"
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
  return jwt.sign(payload, examinerRequestSecret, options);
}

export function verifyExaminerInfoToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, examinerRequestSecret) as JwtPayload;
  } catch {
    return null;
  }
}
