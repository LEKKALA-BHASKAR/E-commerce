import { ApiError } from '../utils/ApiError.js';

const STAFF = new Set(['editor', 'manager', 'superadmin']);

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.userRole) return next(ApiError.unauthorized());
  if (!roles.includes(req.userRole)) return next(ApiError.forbidden('Insufficient role'));
  next();
};

export const requireStaff = (req, _res, next) => {
  if (!req.userRole) return next(ApiError.unauthorized());
  if (!STAFF.has(req.userRole)) return next(ApiError.forbidden('Staff only'));
  next();
};
