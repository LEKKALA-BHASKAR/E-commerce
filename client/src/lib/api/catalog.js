import api from '../axios.js';

export function normalizeProduct(p) {
  if (!p) return p;
  return {
    ...p,
    id: p._id || p.id,
    rating: p.ratingAvg ?? p.rating ?? 0,
    reviewsCount: p.ratingCount ?? p.reviewsCount ?? 0,
    categorySlug: p.category?.slug || p.categorySlug,
    categoryName: p.category?.name,
  };
}

function normList(arr = []) { return arr.map(normalizeProduct); }

export const catalogApi = {
  listCategories: () => api.get('/categories').then((r) => r.data),
  listProducts: (params = {}) => api.get('/products', { params }).then((r) => ({
    ...r.data,
    items: normList(r.data.items),
  })),
  getProduct: (slug) => api.get(`/products/${slug}`).then((r) => ({
    ...r.data,
    product: normalizeProduct(r.data.product),
  })),
  getRelated: (slug) => api.get(`/products/${slug}/related`).then((r) => ({
    ...r.data,
    items: normList(r.data.items),
  })),
  suggest: (q) => api.get('/products/suggest', { params: { q } }).then((r) => ({
    ...r.data,
    items: normList(r.data.items),
  })),
  listReviews: (slug) => api.get(`/products/${slug}/reviews`).then((r) => r.data),
  createReview: (slug, payload) => api.post(`/products/${slug}/reviews`, payload).then((r) => r.data),
  toggleHelpful: (id) => api.post(`/reviews/${id}/helpful`).then((r) => r.data),
};
