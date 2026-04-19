export const formatPrice = (n, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-US').format(Number(n || 0));

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (d) =>
  new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

export const cx = (...c) => c.filter(Boolean).join(' ');
