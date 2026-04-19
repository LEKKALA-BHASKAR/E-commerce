export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || `E${status}`;
  }
  static badRequest(msg = 'Bad request', code) { return new ApiError(400, msg, code); }
  static unauthorized(msg = 'Unauthorized', code) { return new ApiError(401, msg, code); }
  static forbidden(msg = 'Forbidden', code) { return new ApiError(403, msg, code); }
  static notFound(msg = 'Not found', code) { return new ApiError(404, msg, code); }
  static conflict(msg = 'Conflict', code) { return new ApiError(409, msg, code); }
  static internal(msg = 'Internal error', code) { return new ApiError(500, msg, code); }
}
