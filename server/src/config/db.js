import mongoose from 'mongoose';
import { env, flags } from './env.js';

let connected = false;

export async function connectDB() {
  if (!flags.hasMongo) {
    console.warn('[db] MONGODB_URI not set — server starts in degraded mode (no DB).');
    return null;
  }
  if (connected) return mongoose.connection;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: env.NODE_ENV !== 'production' });
  connected = true;
  console.log('[db] Mongo connected');
  return mongoose.connection;
}

export const isDbReady = () => connected;
