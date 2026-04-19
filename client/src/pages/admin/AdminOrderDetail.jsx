import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Printer, Package, MapPin, CreditCard, User, Clock, CheckCircle2, Truck, XCircle, Loader2, Save,
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatDateTime, cx } from '../../lib/formatters.js';

const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-red-50 text-red-700 border-red-200',
};
const ALL_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState('');
  const [timelineNote, setTimelineNote] = useState('');

  const load = () => {
    setLoading(true);
    adminApi.getOrder(id).then(({ order: o }) => {
      setOrder(o);
      setNotes(o.notes || '');
    }).catch((e) => toast.error(e?.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const update = async (patch) => {
    setBusy(true);
    try {
      const r = await adminApi.updateOrder(id, patch);
      setOrder(r.order);
      toast.success('Order updated');
      setTimelineNote('');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>;
  if (!order) return null;

  const flowIdx = FLOW.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-gold">
            <ArrowLeft size={12} /> Back to orders
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="font-display text-3xl">{order.orderNumber}</h1>
            <span className={cx('inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize', STATUS_TONE[order.status])}>{order.status}</span>
          </div>
          <p className="mt-1 text-sm text-ink-400">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.print()}><Printer size={14} /> Print</Button>
        </div>
      </div>

      {flowIdx >= 0 && (
        <GlassCard>
          <h2 className="font-display text-lg mb-4">Fulfillment timeline</h2>
          <ol className="grid grid-cols-5 gap-2">
            {FLOW.map((s, i) => {
              const done = i <= flowIdx;
              const Ico = i === 0 ? Clock : i === 1 ? CreditCard : i === 2 ? Package : i === 3 ? Truck : CheckCircle2;
              return (
                <li key={s} className="relative">
                  <div className={cx('flex flex-col items-center text-center gap-1', done ? 'text-gold' : 'text-ink-300')}>
                    <span className={cx('grid h-9 w-9 place-items-center rounded-full border', done ? 'bg-gold/10 border-gold' : 'border-ink-200 bg-cream-50')}>
                      <Ico size={14} />
                    </span>
                    <span className="text-xs font-medium capitalize">{s}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Package size={16} /> Items</h2>
            <ul className="divide-y divide-ink-100">
              {order.items.map((l, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  {l.image ? <img src={l.image} alt={l.name} className="h-14 w-14 rounded-lg object-cover" /> : <div className="h-14 w-14 rounded-lg bg-cream-200" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.name}</p>
                    <p className="text-xs text-ink-400">{l.variantLabel || l.sku} · Qty {l.qty} × {formatPrice(l.price)}</p>
                  </div>
                  <p className="font-medium">{formatPrice(l.subtotal)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-ink-100 pt-4 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-${formatPrice(order.discount)}`} />}
              <Row label="Shipping" value={order.shippingFee ? formatPrice(order.shippingFee) : 'Free'} />
              {order.tax > 0 && <Row label="Tax" value={formatPrice(order.tax)} />}
              <Row label="Total" value={formatPrice(order.total)} bold />
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4">Order notes</h2>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Internal notes…" />
            <div className="mt-3 flex justify-end">
              <Button size="sm" disabled={busy || notes === order.notes} onClick={() => update({ notes })}><Save size={13} /> Save notes</Button>
            </div>
          </GlassCard>

          {order.timeline?.length > 0 && (
            <GlassCard>
              <h2 className="font-display text-xl mb-4">Activity</h2>
              <ul className="space-y-3 text-sm">
                {[...order.timeline].reverse().map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={cx('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize', STATUS_TONE[t.status] || 'border-ink-200')}>{t.status}</span>
                    <div className="flex-1">
                      {t.note && <p className="text-ink-700">{t.note}</p>}
                      <p className="text-xs text-ink-400">{formatDateTime(t.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="font-display text-xl mb-4">Update status</h2>
            <div className="space-y-3">
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Order status</span>
                <select className="input" value={order.status} onChange={(e) => update({ status: e.target.value, timelineNote })}>
                  {ALL_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Payment status</span>
                <select className="input" value={order.paymentStatus} onChange={(e) => update({ paymentStatus: e.target.value })}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Note for next status change</span>
                <input className="input" value={timelineNote} onChange={(e) => setTimelineNote(e.target.value)} placeholder="e.g. Shipped via BlueDart…" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><User size={14} /> Customer</h2>
            <p className="font-medium">{order.user?.name || '—'}</p>
            <p className="text-sm text-ink-500">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-ink-500">{order.user.phone}</p>}
            {order.user?._id && <Link to={`/admin/customers/${order.user._id}`} className="mt-2 text-xs text-gold hover:underline inline-block">View profile →</Link>}
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><MapPin size={14} /> Ship to</h2>
            <p className="text-sm">{order.shipping.fullName}</p>
            <p className="text-sm text-ink-500">{order.shipping.line1}</p>
            {order.shipping.line2 && <p className="text-sm text-ink-500">{order.shipping.line2}</p>}
            <p className="text-sm text-ink-500">{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
            <p className="text-sm text-ink-500">{order.shipping.country}</p>
            <p className="text-xs text-ink-400 mt-1">{order.shipping.phone}</p>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><CreditCard size={14} /> Payment</h2>
            <p className="text-sm capitalize">Method: {order.paymentMethod}</p>
            <p className="text-sm capitalize">Status: <span className={cx('font-medium', order.paymentStatus === 'paid' ? 'text-emerald-700' : order.paymentStatus === 'failed' ? 'text-red-700' : 'text-amber-700')}>{order.paymentStatus}</span></p>
            {order.razorpay?.paymentId && <p className="text-xs text-ink-400 font-mono mt-1 break-all">{order.razorpay.paymentId}</p>}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={cx('flex items-center justify-between', bold && 'pt-2 border-t border-ink-100 font-medium text-base')}>
      <span className={cx(bold ? 'text-ink-800' : 'text-ink-500')}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
