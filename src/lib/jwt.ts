import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "";
const PASSWORD_JWT_SECRET = process.env.PASSWORD_JWT_SECRET || "";
const EXAMINER_REQUEST_JWT_TOKEN = process.env.EXAMINER_REQUEST_JWT_TOKEN || "";
const ORGANIZATION_REQUEST_JWT_TOKEN = process.env.ORGANIZATION_REQUEST_JWT_TOKEN || EXAMINER_REQUEST_JWT_TOKEN;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET or NEXTAUTH_SECRET must be defined in environment variables");
}

if (!PASSWORD_JWT_SECRET) {
  throw new Error("PASSWORD_JWT_SECRET must be defined in environment variables");
}

if (!EXAMINER_REQUEST_JWT_TOKEN) {
  throw new Error("EXAMINER_REQUEST_JWT_TOKEN must be defined in environment variables");
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

/**
 * Sign a token for examiner resubmission (uses EXAMINER_REQUEST_JWT_TOKEN)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signExaminerResubmitToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '30d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, EXAMINER_REQUEST_JWT_TOKEN, options);
}

/**
 * Verify and decode an examiner resubmission token (uses EXAMINER_REQUEST_JWT_TOKEN)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyExaminerResubmitToken(token: string): any {
  try {
    return jwt.verify(token, EXAMINER_REQUEST_JWT_TOKEN);
  } catch {
    throw new Error("Invalid or expired resubmission token");
  }
}

/**
 * Sign a token for organization resubmission (uses ORGANIZATION_REQUEST_JWT_TOKEN)
 * @param payload - The data to encode in the token
 * @param expiresIn - Token expiration time (default: 30 days)
 * @returns Signed JWT token
 */
export function signOrganizationResubmitToken(
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '30d'
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, ORGANIZATION_REQUEST_JWT_TOKEN, options);
}

/**
 * Verify and decode an organization resubmission token (uses ORGANIZATION_REQUEST_JWT_TOKEN)
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 */
export function verifyOrganizationResubmitToken(token: string): any {
  try {
    return jwt.verify(token, ORGANIZATION_REQUEST_JWT_TOKEN);
  } catch {
    throw new Error("Invalid or expired organization resubmission token");
  }
}

