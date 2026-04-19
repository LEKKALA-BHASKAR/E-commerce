import 'dotenv/config';

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
for (const k of required) {
  if (!process.env[k]) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing ${k} — using dev placeholder. DO NOT ship to prod.`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me_change_me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me_change_me',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Luxe <no-reply@luxe.dev>',
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL || 'admin@luxe.dev',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
};

const isReal = (v) => Boolean(v) && !/replace_me|change_me/i.test(v);

export const flags = {
  hasMongo: Boolean(env.MONGODB_URI),
  hasCloudinary: isReal(env.CLOUDINARY_CLOUD_NAME) && isReal(env.CLOUDINARY_API_KEY) && isReal(env.CLOUDINARY_API_SECRET),
  hasRazorpay: isReal(env.RAZORPAY_KEY_ID) && isReal(env.RAZORPAY_KEY_SECRET),
  hasSMTP: isReal(env.SMTP_HOST) && isReal(env.SMTP_USER) && isReal(env.SMTP_PASS),
};
