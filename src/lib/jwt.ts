import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
const PASSWORD_JWT_SECRET = process.env.PASSWORD_JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables");
}

if (!PASSWORD_JWT_SECRET) {
  throw new Error("PASSWORD_JWT_SECRET must be defined in environment variables");
}

/**
 * Sign a token for password reset or account creation (uses PASSWORD_JWT_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export function signAccountToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, PASSWORD_JWT_SECRET, options);
}

/**
 * Verify and decode a JWT token (uses PASSWORD_JWT_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyAccountToken(token: string): any {
  try {
    return jwt.verify(token, PASSWORD_JWT_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
}

