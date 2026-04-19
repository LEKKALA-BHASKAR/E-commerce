import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function signAccess(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_TTL }
  );
}

export function signRefresh(user, jti = crypto.randomUUID()) {
  const token = jwt.sign({ sub: user._id.toString(), jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });
  return { token, jti };
}

export function verifyAccess(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export const REFRESH_COOKIE = 'luxe_rt';

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.NODE_ENV === 'production',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
