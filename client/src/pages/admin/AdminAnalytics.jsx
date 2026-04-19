import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag, Calendar, Percent, IndianRupee, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatNumber, cx } from '../../lib/formatters.js';

const PIE_COLORS = ['#D97706', '#E58825', '#EFA152', '#F4C283', '#A89479', '#C9B89A'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.stats().then(setData).catch((e) => setError(e?.response?.data?.message || 'Failed to load'));
  }, []);

  const totals = useMemo(() => {
    if (!data) return { revenue: 0, orders: 0, aov: 0 };
    const series = data.revenueSeries || [];
    const revenue = series.reduce((s, p) => s + (p.revenue || 0), 0);
    const orders = series.reduce((s, p) => s + (p.orders || 0), 0);
    return { revenue, orders, aov: orders ? Math.round(revenue / orders) : 0 };
  }, [data]);

  const statusData = useMemo(() => {
    if (!data?.stats?.statusCounts) return [];
    return Object.entries(data.stats.statusCounts).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (error) {
    return <GlassCard className="text-center py-16"><p className="text-sm text-red-700">{error}</p></GlassCard>;
  }
  if (!data) {
    return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Insights</p>
        <h1 className="font-display text-3xl mt-1">Analytics</h1>
        <p className="mt-1 text-sm text-ink-400">Live revenue, orders, and conversion across the storefront — last 30 days.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={IndianRupee} label="Revenue (30d)" value={formatPrice(totals.revenue)} />
        <Stat icon={ShoppingBag} label="Orders (30d)" value={formatNumber(totals.orders)} />
        <Stat icon={Calendar} label="Avg order value" value={formatPrice(totals.aov)} />
        <Stat icon={TrendingUp} label="Lifetime revenue" value={formatPrice(data.stats.revenue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-xl mb-1">Revenue trend</h2>
          <p className="text-xs text-ink-400 mb-4">Daily totals across the last 30 days</p>
          <div className="h-72">
            {data.revenueSeries.length ? (
              <ResponsiveContainer>
                <AreaChart data={data.revenueSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(40,25,10,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F1E7D6', borderRadius: 12, color: '#1B1410' }} formatter={(v) => formatPrice(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2} fill="url(#rev2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl mb-1">Order pipeline</h2>
          <p className="text-xs text-ink-400 mb-4">Distribution by status</p>
          <div className="h-72">
            {statusData.length ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={3}>
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F1E7D6', borderRadius: 12, color: '#1B1410' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#544334', textTransform: 'capitalize' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-xl mb-1">Orders per day</h2>
          <p className="text-xs text-ink-400 mb-4">Volume over the last 30 days</p>
          <div className="h-64">
            {data.revenueSeries.length ? (
              <ResponsiveContainer>
                <BarChart data={data.revenueSeries} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid stroke="rgba(40,25,10,0.06)" vertical={false} />
                  <XAxis dataKey="label" stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A89479" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #F1E7D6', borderRadius: 12, color: '#1B1410' }} />
                  <Bar dataKey="orders" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="font-display text-xl mb-4">Top sellers</h2>
          {data.topProducts?.length ? (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/10 text-gold font-display text-sm">{i + 1}</span>
                  {p.image ? <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" /> : <div className="h-9 w-9 rounded-lg bg-cream-200" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-400">{p.sold} sold · {formatPrice(p.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <GlassCard>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><Icon size={18} /></div>
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </GlassCard>
  );
}

function Empty() {
  return <div className="h-full grid place-items-center text-sm text-ink-400">Not enough data yet.</div>;
}
