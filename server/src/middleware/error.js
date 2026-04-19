import { ApiError } from '../utils/ApiError.js';

export function notFound(_req, _res, next) {
  next(ApiError.notFound('Route not found'));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    ok: false,
    message: err.message || 'Internal server error',
    code: err.code || `E${status}`,
  };
  if (process.env.NODE_ENV !== 'production' && status >= 500) payload.stack = err.stack;
  if (err.issues) payload.issues = err.issues; // zod
  res.status(status).json(payload);
}
