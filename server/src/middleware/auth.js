import { ApiError } from '../utils/ApiError.js';
import { verifyAccess } from '../utils/jwt.js';
import { User } from '../models/User.js';

export async function authRequired(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing access token');
    const payload = verifyAccess(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch (e) {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export async function loadUser(req, _res, next) {
  try {
    if (!req.userId) return next();
    const user = await User.findById(req.userId);
    if (!user) throw ApiError.unauthorized('User not found');
    if (user.blocked) throw ApiError.forbidden('Account suspended');
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}

export const authAndLoad = [authRequired, loadUser];
