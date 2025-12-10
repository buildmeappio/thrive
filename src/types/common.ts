/**
 * Common types used across the application
 */

/**
 * Standard error type for catch blocks
 */
export type AppError = Error & {
  code?: string | number;
  statusCode?: number;
  status?: number;
  message: string;
};

/**
 * Logger function arguments - accepts any values for console logging
 */
export type LoggerArgs = unknown[];

/**
 * Generic object type for flexible data structures
 */
export type RecordObject = Record<string, unknown>;

/**
 * Generic array type
 */
export type UnknownArray = unknown[];

