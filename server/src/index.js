import http from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const server = http.createServer(app);

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[db] connection failed:', err.message);
  }
  server.listen(env.PORT, () => {
    console.log(`[server] http://localhost:${env.PORT}  (env=${env.NODE_ENV})`);
  });
})();

process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));
