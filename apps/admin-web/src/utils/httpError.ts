type ExtraProps = {
  code?: string;
  details?: unknown;
};

export class HttpError extends Error {
  status: number;
  details?: unknown;
  code?: string;
  constructor(status: number, message = 'Error', { code, details }: ExtraProps = {}) {
    super(message);
    this.status = status;
    this.code = code || '';
    this.details = details;
  }

  static unauthorized(message = 'Unauthorized', { code, details }: ExtraProps = {}) {
    return new HttpError(401, message, {
      code: code || 'UNAUTHORIZED',
      details,
    });
  }

  static notFound(message = 'Not Found', { code, details }: ExtraProps = {}) {
    return new HttpError(404, message, { code: code || 'NOT_FOUND', details });
  }

  static badRequest(message = 'Bad Request', { code, details }: ExtraProps = {}) {
    return new HttpError(400, message, {
      code: code || 'BAD_REQUEST',
      details,
    });
  }

  static internalServerError(
    message = 'Internal Server Error',
    { code, details }: ExtraProps = {}
  ) {
    return new HttpError(500, message, {
      code: code || 'INTERNAL_SERVER_ERROR',
      details,
    });
  }

  static conflict(message = 'Conflict', { code, details }: ExtraProps = {}) {
    return new HttpError(409, message, { code: code || 'CONFLICT', details });
  }

  static forbidden(message = 'Forbidden', { code, details }: ExtraProps = {}) {
    return new HttpError(403, message, { code: code || 'FORBIDDEN', details });
  }

  static fromError(
    error: unknown,
    defaultMessage = 'Internal Server Error',
    { code, details }: ExtraProps = {}
  ) {
    if (error instanceof HttpError) {
      return error;
    }
    return new HttpError(500, defaultMessage, {
      code: code || 'INTERNAL_SERVER_ERROR',
      details,
    });
  }
}
