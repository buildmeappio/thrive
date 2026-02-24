/**
 * Environment Detection Utility
 * Determines the current environment based on NEXT_PUBLIC_APP_URL
 */

export type Environment = 'local' | 'dev' | 'staging' | 'prod';

/**
 * Gets the current environment based on NEXT_PUBLIC_APP_URL
 *
 * @param appUrl - Optional app URL. If not provided, uses NEXT_PUBLIC_APP_URL from env
 * @returns The detected environment: 'local', 'dev', 'staging', or 'prod'
 *
 * @example
 * ```ts
 * const env = getEnvironment(); // Uses NEXT_PUBLIC_APP_URL from env
 * const env = getEnvironment("https://portal-dev.example.com"); // 'dev'
 * const env = getEnvironment("http://localhost:3000"); // 'local'
 * ```
 */
export function getEnvironment(appUrl?: string): Environment {
  const url = appUrl || process.env.NEXT_PUBLIC_APP_URL || '';

  // Check for localhost (case-insensitive)
  if (url.toLowerCase().includes('localhost')) {
    return 'local';
  }

  // Check for dev environment
  if (url.includes('portal-dev')) {
    return 'dev';
  }

  // Check for staging environment
  if (url.includes('portal-stg')) {
    return 'staging';
  }

  // Default to production
  return 'prod';
}

/**
 * Checks if the current environment is local
 */
export function isLocal(): boolean {
  return getEnvironment() === 'local';
}

/**
 * Checks if the current environment is development
 */
export function isDev(): boolean {
  return getEnvironment() === 'dev';
}

/**
 * Checks if the current environment is staging
 */
export function isStaging(): boolean {
  return getEnvironment() === 'staging';
}

/**
 * Checks if the current environment is production
 */
export function isProd(): boolean {
  return getEnvironment() === 'prod';
}

/**
 * Checks if the current environment is development or local
 */
export function isDevelopmentOrLocal(): boolean {
  const env = getEnvironment();
  return env === 'dev' || env === 'local';
}
