import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TrendingUp, Package, Users, IndianRupee, ShoppingCart, Activity, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { selectUser } from '../../store/slices/authSlice.js';
import { formatPrice, formatNumber, formatDateTime, cx } from '../../lib/formatters.js';

const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
};

export default function Overview() {
  const user = useSelector(selectUser);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.stats().then(setData).catch((e) => setError(e?.response?.data?.message || 'Failed to load'));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p className="mt-1 text-sm text-ink-400">Live snapshot from the storefront.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip"><Activity size={12} className="text-gold" /> Live</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={IndianRupee} label="Lifetime revenue" value={data ? formatPrice(data.stats.revenue) : '—'} sub={data ? `${formatPrice(data.stats.revenueWeek)} this week` : ''} />
        <Kpi icon={ShoppingCart} label="Orders" value={data ? formatNumber(data.stats.orders) : '—'} sub={data ? `${data.stats.ordersToday} today · ${data.stats.ordersWeek} this week` : ''} />
        <Kpi icon={Users} label="Customers" value={data ? formatNumber(data.stats.customers) : '—'} sub={data ? `+${data.stats.newCustomers} new this week` : ''} />
        <Kpi icon={Package} label="Products" value={data ? formatNumber(data.stats.activeProducts) : '—'} sub={data ? `${data.stats.lowStock} low on stock` : ''} accent={data?.stats.lowStock > 0 ? 'warn' : null} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl">Revenue (last 30d)</h2>
              <p className="text-xs text-ink-400">Daily order totals</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-gold inline-flex items-center gap-1 hover:underline">
              All orders <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="h-72">
            {data?.revenueSeries?.length ? (
              <ResponsiveContainer>
                <AreaChart data={data.revenueSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(40,25,10,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F1E7D6', borderRadius: 12, color: '#1B1410' }} formatter={(v) => formatPrice(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full grid place-items-center text-sm text-ink-400">{data ? 'No orders yet' : 'Loading…'}</div>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl mb-4">Order pipeline</h2>
          <ul className="space-y-2">
            {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
              <li key={s} className="flex items-center justify-between rounded-lg border border-ink-100 bg-cream-50/60 px-3 py-2 text-sm">
                <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', STATUS_TONE[s])}>{s}</span>
                <span className="font-medium">{data?.stats?.statusCounts?.[s] || 0}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 !p-0 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-ink-100">
            <h2 className="font-display text-xl">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold inline-flex items-center gap-1 hover:underline">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-cream-100/60 text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-2.5 text-left">Order</th>
                <th className="px-4 py-2.5 text-left">Customer</th>
                <th className="px-4 py-2.5 text-right">Total</th>
                <th className="px-4 py-2.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {(data?.recentOrders || []).map((o) => (
                <tr key={o._id} className="hover:bg-cream-50/70">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o._id}`} className="font-mono text-xs text-ink-700 hover:text-gold">{o.orderNumber}</Link>
                    <p className="text-[11px] text-ink-400">{formatDateTime(o.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.user?.name || '—'}</p>
                    <p className="text-xs text-ink-400">{o.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cx('inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', STATUS_TONE[o.status])}>{o.status}</span>
                  </td>
                </tr>
              ))}
              {data && data.recentOrders.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-400">No orders yet.</td></tr>
              )}
              {!data && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-400">Loading…</td></tr>
              )}
            </tbody>
          </table>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl mb-4">Top sellers</h2>
          <ul className="space-y-3">
            {(data?.topProducts || []).map((p) => (
              <li key={p._id} className="flex items-center gap-3">
                {p.image ? <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-cream-200" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-400">{p.sold} sold · {formatPrice(p.revenue)}</p>
                </div>
              </li>
            ))}
            {data && data.topProducts.length === 0 && <li className="text-sm text-ink-400">No sales yet.</li>}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <span className={cx('grid h-10 w-10 place-items-center rounded-xl', accent === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-gold/10 text-gold')}>
          <Icon size={18} />
        </span>
        {accent === 'warn' && <AlertTriangle size={14} className="text-amber-600" />}
      </div>
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </GlassCard>
  );
}
