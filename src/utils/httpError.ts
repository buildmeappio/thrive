export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message = 'Error', details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }

  static notFound(message = 'Not found') {
    return new HttpError(404, message);
  }

  static badRequest(message = 'Bad request') {
    return new HttpError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message);
  }

  static internal(message = 'Internal server error') {
    return new HttpError(500, message);
  }

  static handleServiceError(error: unknown, message = 'Failed to process request') {
    console.error(error);

    if (error instanceof HttpError) {
      return error;
    }

    return HttpError.internal(message);
  }
}
