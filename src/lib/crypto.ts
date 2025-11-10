import { createHash } from "crypto";

/**
 * Generate SHA-256 hash from a string
 * @param data - String data to hash
 * @returns SHA-256 hash in hexadecimal format
 */
export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate SHA-256 hash from a Buffer
 * @param buffer - Buffer to hash
 * @returns SHA-256 hash in hexadecimal format
 */
export function sha256Buffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Generate hash for contract data
 * Combines template body and data into a single hash
 * @param templateBody - Template HTML body
 * @param contractData - Contract data object
 * @returns SHA-256 hash
 */
export function hashContractData(templateBody: string, contractData: Record<string, any>): string {
  const combined = templateBody + JSON.stringify(contractData);
  return sha256(combined);
}

