import api from '../axios.js';

const unwrap = (p) => p.then((r) => r.data);

export const adminApi = {
  // Stats
  stats: () => unwrap(api.get('/admin/stats')),

  // Products
  listProducts: (params = {}) => unwrap(api.get('/admin/products', { params })),
  getProduct: (id) => unwrap(api.get(`/admin/products/${id}`)),
  createProduct: (body) => unwrap(api.post('/admin/products', body)),
  updateProduct: (id, body) => unwrap(api.patch(`/admin/products/${id}`, body)),
  deleteProduct: (id) => unwrap(api.delete(`/admin/products/${id}`)),

  // Categories
  listCategories: () => unwrap(api.get('/admin/categories')),
  createCategory: (body) => unwrap(api.post('/admin/categories', body)),
  updateCategory: (id, body) => unwrap(api.patch(`/admin/categories/${id}`, body)),
  deleteCategory: (id) => unwrap(api.delete(`/admin/categories/${id}`)),

  // Orders
  listOrders: (params = {}) => unwrap(api.get('/admin/orders', { params })),
  getOrder: (id) => unwrap(api.get(`/admin/orders/${id}`)),
  updateOrder: (id, body) => unwrap(api.patch(`/admin/orders/${id}`, body)),

  // Customers
  listCustomers: (params = {}) => unwrap(api.get('/admin/customers', { params })),
  getCustomer: (id) => unwrap(api.get(`/admin/customers/${id}`)),
  updateCustomer: (id, body) => unwrap(api.patch(`/admin/customers/${id}`, body)),

  // Coupons
  listCoupons: () => unwrap(api.get('/admin/coupons')),
  createCoupon: (body) => unwrap(api.post('/admin/coupons', body)),
  updateCoupon: (id, body) => unwrap(api.patch(`/admin/coupons/${id}`, body)),
  deleteCoupon: (id) => unwrap(api.delete(`/admin/coupons/${id}`)),

  // Reviews
  listReviews: (params = {}) => unwrap(api.get('/admin/reviews', { params })),
  updateReview: (id, body) => unwrap(api.patch(`/admin/reviews/${id}`, body)),
  deleteReview: (id) => unwrap(api.delete(`/admin/reviews/${id}`)),

  // Settings
  getSettings: () => unwrap(api.get('/admin/settings')),
  updateSettings: (values) => unwrap(api.put('/admin/settings', { values })),

  // Pages (CMS)
  listPages: () => unwrap(api.get('/admin/pages')),
  createPage: (body) => unwrap(api.post('/admin/pages', body)),
  updatePage: (id, body) => unwrap(api.patch(`/admin/pages/${id}`, body)),
  deletePage: (id) => unwrap(api.delete(`/admin/pages/${id}`)),
};
