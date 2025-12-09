/**
 * API and service response types
 */

/**
 * S3 response body stream chunk
 */
export type S3StreamChunk = Uint8Array | Buffer | ReadableStream<Uint8Array>;

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  code?: string | number;
  statusCode?: number;
  message?: string;
  error?: string;
}

/**
 * Generic API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

