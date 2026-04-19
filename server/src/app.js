import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, flags } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, env: env.NODE_ENV, flags, ts: new Date().toISOString() })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
