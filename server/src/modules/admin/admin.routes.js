import { Router } from 'express';
import * as ctrl from './admin.controller.js';
import { authRequired, loadUser } from '../../middleware/auth.js';
import { requireStaff } from '../../middleware/rbac.js';
import { validate } from '../../middleware/validate.js';
import {
  idParam, listQuery,
  productCreate, productUpdate,
  categoryCreate, categoryUpdate,
  couponCreate, couponUpdate,
  orderUpdate, customerUpdate, reviewUpdate,
  pageCreate, pageUpdate, settingsUpdate,
} from './admin.validators.js';

const r = Router();

// All admin routes require staff role.
r.use(authRequired, loadUser, requireStaff);

// Stats
r.get('/stats', ctrl.stats);

// Products
r.get('/products', validate({ query: listQuery }), ctrl.listProducts);
r.post('/products', validate({ body: productCreate }), ctrl.createProduct);
r.get('/products/:id', validate({ params: idParam }), ctrl.getProduct);
r.patch('/products/:id', validate({ params: idParam, body: productUpdate }), ctrl.updateProduct);
r.delete('/products/:id', validate({ params: idParam }), ctrl.deleteProduct);

// Categories
r.get('/categories', ctrl.listCategories);
r.post('/categories', validate({ body: categoryCreate }), ctrl.createCategory);
r.patch('/categories/:id', validate({ params: idParam, body: categoryUpdate }), ctrl.updateCategory);
r.delete('/categories/:id', validate({ params: idParam }), ctrl.deleteCategory);

// Orders
r.get('/orders', validate({ query: listQuery }), ctrl.listOrders);
r.get('/orders/:id', validate({ params: idParam }), ctrl.getOrder);
r.patch('/orders/:id', validate({ params: idParam, body: orderUpdate }), ctrl.updateOrder);

// Customers
r.get('/customers', validate({ query: listQuery }), ctrl.listCustomers);
r.get('/customers/:id', validate({ params: idParam }), ctrl.getCustomer);
r.patch('/customers/:id', validate({ params: idParam, body: customerUpdate }), ctrl.updateCustomer);

// Coupons
r.get('/coupons', ctrl.listCoupons);
r.post('/coupons', validate({ body: couponCreate }), ctrl.createCoupon);
r.patch('/coupons/:id', validate({ params: idParam, body: couponUpdate }), ctrl.updateCoupon);
r.delete('/coupons/:id', validate({ params: idParam }), ctrl.deleteCoupon);

// Reviews
r.get('/reviews', validate({ query: listQuery }), ctrl.listReviews);
r.patch('/reviews/:id', validate({ params: idParam, body: reviewUpdate }), ctrl.updateReview);
r.delete('/reviews/:id', validate({ params: idParam }), ctrl.deleteReview);
// Settings (key-value)
r.get('/settings', ctrl.getSettings);
r.put('/settings', validate({ body: settingsUpdate }), ctrl.updateSettings);

// CMS Pages
r.get('/pages', ctrl.listPages);
r.post('/pages', validate({ body: pageCreate }), ctrl.createPage);
r.patch('/pages/:id', validate({ params: idParam, body: pageUpdate }), ctrl.updatePage);
r.delete('/pages/:id', validate({ params: idParam }), ctrl.deletePage);


export default r;
