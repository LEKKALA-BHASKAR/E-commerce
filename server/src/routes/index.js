import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import catalogRoutes from '../modules/catalog/catalog.routes.js';
import checkoutRoutes from '../modules/checkout/checkout.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const r = Router();

r.get('/ping', (_req, res) => res.json({ ok: true, msg: 'pong' }));
r.use('/auth', authRoutes);
r.use('/', catalogRoutes);
r.use('/', checkoutRoutes);
r.use('/admin', adminRoutes);

export default r;
