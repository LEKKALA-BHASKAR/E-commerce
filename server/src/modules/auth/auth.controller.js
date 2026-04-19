import crypto from 'node:crypto';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  signAccess,
  signRefresh,
  verifyRefresh,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../../utils/jwt.js';

const MAX_REFRESH_TOKENS = 5;

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('An account already exists with that email', 'E_EMAIL_TAKEN');

  const user = new User({ name, email });
  await user.setPassword(password);
  const { token: refresh, jti } = signRefresh(user);
  user.refreshTokens = [jti];
  user.lastLoginAt = new Date();
  await user.save();

  const access = signAccess(user);
  res.cookie(REFRESH_COOKIE, refresh, refreshCookieOptions());
  res.status(201).json({ ok: true, user: user.toSafeJSON(), accessToken: access });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user) throw ApiError.unauthorized('Invalid credentials', 'E_BAD_CREDENTIALS');
  if (user.blocked) throw ApiError.forbidden('Account suspended', 'E_BLOCKED');

  const ok = await user.verifyPassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials', 'E_BAD_CREDENTIALS');

  const { token: refresh, jti } = signRefresh(user);
  user.refreshTokens = [...(user.refreshTokens || []), jti].slice(-MAX_REFRESH_TOKENS);
  user.lastLoginAt = new Date();
  await user.save();

  const access = signAccess(user);
  res.cookie(REFRESH_COOKIE, refresh, refreshCookieOptions());
  res.json({ ok: true, user: user.toSafeJSON(), accessToken: access });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token', 'E_NO_REFRESH');

  let payload;
  try {
    payload = verifyRefresh(token);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token', 'E_BAD_REFRESH');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || user.blocked) throw ApiError.unauthorized('Account unavailable');

  // Rotate: jti must be present, then replaced.
  if (!user.refreshTokens?.includes(payload.jti)) {
    // Reuse / theft suspected — clear all refresh tokens.
    user.refreshTokens = [];
    await user.save();
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
    throw ApiError.unauthorized('Refresh token reuse detected', 'E_REUSED');
  }

  const { token: nextRefresh, jti: nextJti } = signRefresh(user);
  user.refreshTokens = user.refreshTokens.filter((j) => j !== payload.jti).concat(nextJti).slice(-MAX_REFRESH_TOKENS);
  await user.save();

  const access = signAccess(user);
  res.cookie(REFRESH_COOKIE, nextRefresh, refreshCookieOptions());
  res.json({ ok: true, user: user.toSafeJSON(), accessToken: access });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    try {
      const payload = verifyRefresh(token);
      const user = await User.findById(payload.sub).select('+refreshTokens');
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((j) => j !== payload.jti);
        await user.save();
      }
    } catch {
      /* ignore */
    }
  }
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
  res.json({ ok: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, user: req.user.toSafeJSON() });
});

export const forgot = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+resetToken +resetTokenExpiresAt');
  // Always respond ok to avoid user enumeration.
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    // TODO (Phase 4): wire Nodemailer to actually send. For now, dev-log.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[auth] password reset link: http://localhost:5173/reset?token=${raw}`);
    }
  }
  res.json({ ok: true });
});

export const reset = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpiresAt: { $gt: new Date() },
  }).select('+resetToken +resetTokenExpiresAt');
  if (!user) throw ApiError.badRequest('Reset link is invalid or expired', 'E_RESET_INVALID');
  await user.setPassword(password);
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  user.refreshTokens = [];
  await user.save();
  res.json({ ok: true });
});
