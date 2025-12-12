/**
 * API and service response types
 */

/**
 * S3 response body stream chunk
 * AWS SDK v3 GetObjectCommand output Body can be various types
 */
export type S3StreamChunk =
  | Uint8Array
  | Buffer
  | ReadableStream<Uint8Array>
  | { transformToString(): Promise<string> }
  | {
      on(event: string, listener: (chunk: Buffer) => void): void;
      on(event: "error", listener: (error: Error) => void): void;
      on(event: "end", listener: () => void): void;
    };

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
