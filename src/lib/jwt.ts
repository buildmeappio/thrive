import ErrorMessages from "@/constants/ErrorMessages";
import jwt, {
  type Secret,
  type SignOptions,
  type JwtPayload,
} from "jsonwebtoken";

const checkJwtSecrets = () => {
  if (process.env.NODE_ENV === "test" || process.env.CI === "true") {
    return {
      otpSecret: "",
      passwordSecret: "",
      examinerRequestSecret: "",
    };
  }

  if (
    !process.env.JWT_OTP_SECRET ||
    !process.env.JWT_SET_PASSWORD_SECRET ||
    !process.env.JWT_EXAMINER_INFO_REQUEST_SECRET
  ) {
    throw new Error(ErrorMessages.JWT_SECRETS_REQUIRED);
  }

  return {
    otpSecret: process.env.JWT_OTP_SECRET as Secret,
    passwordSecret: process.env.JWT_SET_PASSWORD_SECRET as Secret,
    examinerRequestSecret: process.env
      .JWT_EXAMINER_INFO_REQUEST_SECRET as Secret,
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
