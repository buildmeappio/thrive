export class HttpError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message = 'Error', details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
