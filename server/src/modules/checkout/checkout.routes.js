import { Router } from 'express';
import * as ctrl from './checkout.controller.js';
import { authRequired, loadUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { validateCoupon, createOrder, verifyPayment } from './checkout.validators.js';

const r = Router();

r.post('/coupons/validate', validate({ body: validateCoupon }), ctrl.validateCouponCtrl);

r.post('/orders', authRequired, loadUser, validate({ body: createOrder }), ctrl.createOrderCtrl);
r.post('/orders/verify', authRequired, loadUser, validate({ body: verifyPayment }), ctrl.verifyPaymentCtrl);
r.get('/orders', authRequired, loadUser, ctrl.listMyOrders);
r.get('/orders/:id', authRequired, loadUser, ctrl.getMyOrder);
r.post('/orders/:id/cancel', authRequired, loadUser, ctrl.cancelMyOrder);

export default r;
