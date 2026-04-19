import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env, flags } from '../config/env.js';

let _client = null;
export function razorpay() {
  if (!flags.hasRazorpay) return null;
  if (!_client) {
    _client = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
  }
  return _client;
}

export function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!flags.hasRazorpay) return false;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}
