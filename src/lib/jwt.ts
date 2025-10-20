import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
const JWT_SET_PASSWORD_SECRET = process.env.JWT_SET_PASSWORD_SECRET || "";
const JWT_EXAMINER_INFO_REQUEST_SECRET = process.env.JWT_EXAMINER_INFO_REQUEST_SECRET || "";
const JWT_ORGANIZATION_INFO_REQUEST_SECRET = process.env.JWT_ORGANIZATION_INFO_REQUEST_SECRET || JWT_EXAMINER_INFO_REQUEST_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables");
}

if (!JWT_SET_PASSWORD_SECRET) {
  throw new Error("JWT_SET_PASSWORD_SECRET must be defined in environment variables");
}

if (!JWT_EXAMINER_INFO_REQUEST_SECRET) {
  throw new Error("JWT_EXAMINER_INFO_REQUEST_SECRET must be defined in environment variables");
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
  return jwt.sign(payload, JWT_SET_PASSWORD_SECRET, options);
}

/**
 * Verify and decode a JWT token (uses PASSWORD_JWT_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyAccountToken(token: string): string | jwt.JwtPayload {
  try {
    return jwt.verify(token, JWT_SET_PASSWORD_SECRET);
  } catch {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Sign a token for examiner resubmission (uses JWT_EXAMINATION_INFO_REQUEST_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signExaminerResubmitToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '30d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_EXAMINER_INFO_REQUEST_SECRET, options);
}

/**
 * Verify and decode an examiner resubmission token (uses JWT_EXAMINATION_INFO_REQUEST_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyExaminerResubmitToken(token: string): string | jwt.JwtPayload {
  try {
    return jwt.verify(token, JWT_EXAMINER_INFO_REQUEST_SECRET);
  } catch {
    throw new Error("Invalid or expired resubmission token");
  }
}

/**
 * Sign a token for organization resubmission (uses JWT_ORGANIZATION_INFO_REQUEST_SECRET)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signOrganizationResubmitToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '30d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_ORGANIZATION_INFO_REQUEST_SECRET, options);
}

/**
 * Verify and decode an organization resubmission token (uses JWT_ORGANIZATION_INFO_REQUEST_SECRET)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyOrganizationResubmitToken(token: string): string | jwt.JwtPayload {
  try {
    return jwt.verify(token, JWT_ORGANIZATION_INFO_REQUEST_SECRET);
  } catch {
    throw new Error("Invalid or expired organization resubmission token");
  }
}

