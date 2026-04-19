import api from '../axios.js';

export const checkoutApi = {
  validateCoupon: (code, subtotal) =>
    api.post('/coupons/validate', { code, subtotal }).then((r) => r.data),
  createOrder: (payload) => api.post('/orders', payload).then((r) => r.data),
  verifyPayment: (payload) => api.post('/orders/verify', payload).then((r) => r.data),
  listOrders: () => api.get('/orders').then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`).then((r) => r.data),
};

// Lazy-load Razorpay checkout script (~30kb)
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}
