class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }

  static fromError(error: HttpError | Error | unknown, message: string, statusCode: number) {
    if (error instanceof HttpError) {
      return new HttpError(error.message, error.statusCode);
    } else if (error instanceof Error) {
      return new HttpError(error.message, statusCode);
    } else if (typeof error === 'string') {
      return new HttpError(error, statusCode);
    } else {
      return new HttpError(message, statusCode);
    }
  }

  static unauthorized(message: string) {
    return new HttpError(message, 401);
  }

  static forbidden(message: string) {
    return new HttpError(message, 403);
  }

  static notFound(message: string) {
    return new HttpError(message, 404);
  }

  static badRequest(message: string) {
    return new HttpError(message, 400);
  }

  static internalServerError(message: string) {
    return new HttpError(message, 500);
  }
}

export default HttpError;
