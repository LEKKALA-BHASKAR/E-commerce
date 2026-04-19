import { Router } from 'express';
import * as ctrl from './catalog.controller.js';
import { authRequired, loadUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { listProductsQuery, reviewBody, suggestQuery } from './catalog.validators.js';

const r = Router();

// Categories
r.get('/categories', ctrl.listCategories);

// Products
r.get('/products', validate({ query: listProductsQuery }), ctrl.listProducts);
r.get('/products/suggest', validate({ query: suggestQuery }), ctrl.suggest);
r.get('/products/:slug', ctrl.getProductBySlug);
r.get('/products/:slug/related', ctrl.getRelated);

// Reviews
r.get('/products/:slug/reviews', ctrl.listReviews);
r.post('/products/:slug/reviews', authRequired, loadUser, validate({ body: reviewBody }), ctrl.createReview);
r.post('/reviews/:id/helpful', authRequired, loadUser, ctrl.toggleHelpful);

export default r;
