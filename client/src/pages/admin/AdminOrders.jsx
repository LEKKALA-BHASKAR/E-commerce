import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Eye, Package, Truck, CheckCircle2, XCircle, Clock, Loader2, IndianRupee } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatDateTime, formatNumber, cx } from '../../lib/formatters.js';
import { useDebounce } from '../../lib/useDebounce.js';

const STATUSES = ['all', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const debQ = useDebounce(q, 300);

  useEffect(() => {
    setLoading(true);
    adminApi.listOrders({ q: debQ, status, page, limit: 15 })
      .then((r) => setData({ items: r.items, total: r.total, pages: r.pages }))
      .catch((e) => toast.error(e?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [debQ, status, page]);

  const tally = useMemo(() => {
    const t = { revenue: 0, processing: 0, shipped: 0 };
    data.items.forEach((o) => {
      if (o.paymentStatus === 'paid') t.revenue += o.total;
      if (o.status === 'processing' || o.status === 'paid' || o.status === 'pending') t.processing++;
      if (o.status === 'shipped') t.shipped++;
    });
    return t;
  }, [data.items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Operations</p>
          <h1 className="font-display text-3xl mt-1">Orders</h1>
          <p className="mt-1 text-sm text-ink-400">{formatNumber(data.total)} total · page {page} of {data.pages}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Package} label="Total" value={formatNumber(data.total)} />
        <Stat icon={Clock} label="To fulfil" value={tally.processing} accent="amber" />
        <Stat icon={Truck} label="Shipped (page)" value={tally.shipped} accent="sky" />
        <Stat icon={IndianRupee} label="Revenue (page)" value={formatPrice(tally.revenue)} accent="emerald" />
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="input pl-9 py-2.5" placeholder="Search by order #, customer name, or email…" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={cx(
                  'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition capitalize',
                  status === s ? 'bg-gold text-white border-gold' : 'border-ink-200 text-ink-500 hover:border-gold hover:text-gold'
                )}
              >{s}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream-100/60 text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading && (
                <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 className="inline animate-spin text-gold" size={18} /></td></tr>
              )}
              {!loading && data.items.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-400">No orders match.</td></tr>
              )}
              {!loading && data.items.map((o) => (
                <tr key={o._id} className="hover:bg-cream-50/70">
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.name || '—'}</p>
                    <p className="text-xs text-ink-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDateTime(o.createdAt)}</td>
                  <td className="px-4 py-3 text-right">{o.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cx('inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize', STATUS_TONE[o.status])}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500 capitalize">{o.paymentMethod} · {o.paymentStatus}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${o._id}`} className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                      <Eye size={12} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-ink-100 text-sm">
            <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="text-ink-400">Page {page} of {data.pages}</span>
            <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  const tones = {
    amber: 'bg-amber-100 text-amber-700',
    sky: 'bg-sky-100 text-sky-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    default: 'bg-gold/10 text-gold',
  };
  return (
    <GlassCard>
      <div className={cx('grid h-10 w-10 place-items-center rounded-xl', tones[accent] || tones.default)}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </GlassCard>
  );
}
