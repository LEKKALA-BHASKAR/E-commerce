import api from '../axios.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgot: (email) => api.post('/auth/forgot', { email }).then((r) => r.data),
  reset: (token, password) => api.post('/auth/reset', { token, password }).then((r) => r.data),
};
