import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import { checkoutApi } from '../../lib/api/checkout.js';
import { formatPrice, formatDateTime, cx } from '../../lib/formatters.js';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () =>
    checkoutApi.getOrder(id).then(({ order }) => setOrder(order))
      .catch((e) => setError(e?.response?.data?.message || 'Order not found'));

  useEffect(() => { fetchOrder(); /* eslint-disable-next-line */ }, [id]);

  const onCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { order: o } = await checkoutApi.cancelOrder(id);
      setOrder(o);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <section className="container-luxe py-24 text-center">
        <h1 className="font-display text-3xl">{error}</h1>
        <Link to="/account/orders" className="mt-6 inline-block"><Button variant="ghost">Back to orders</Button></Link>
      </section>
    );
  }
  if (!order) return <section className="container-luxe py-16 text-center text-ink-300">Loading…</section>;

  const canCancel = ['pending', 'paid', 'processing'].includes(order.status);

  return (
    <section className="container-luxe py-12 lg:py-16">
      <Link to="/account/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ink-300 hover:text-gold">
        <ArrowLeft size={12} /> All orders
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{order.status}</p>
          <h1 className="mt-2 font-display text-4xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-300">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        {canCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={cancelling}>
            <X size={14} /> {cancelling ? 'Cancelling…' : 'Cancel order'}
          </Button>
        )}
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <h2 className="font-display text-xl mb-4">Items</h2>
            <ul className="divide-y divide-white/5">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-4">
                  <img src={it.image} alt={it.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <Link to={`/product/${it.slug}`} className="font-medium hover:text-gold">{it.name}</Link>
                    <p className="text-xs text-ink-300">{it.variantLabel ? `${it.variantLabel} · ` : ''}Qty {it.qty} · {formatPrice(it.price)}</p>
                  </div>
                  <p className="text-sm">{formatPrice(it.subtotal)}</p>
                </li>
              ))}
            </ul>
          </div>

          {order.timeline?.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h2 className="font-display text-xl mb-4">Timeline</h2>
              <ol className="space-y-4">
                {order.timeline.map((t, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gold" />
                    <div>
                      <p className="text-sm font-medium capitalize">{t.status.replace('_', ' ')}</p>
                      {t.note && <p className="text-xs text-ink-300">{t.note}</p>}
                      <p className="text-[10px] uppercase tracking-wider text-ink-300">{formatDateTime(t.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm">
            <h3 className="font-display text-lg mb-3">Summary</h3>
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-${formatPrice(order.discount)}`} accent />}
            <Row label="Shipping" value={order.shippingFee ? formatPrice(order.shippingFee) : 'Free'} />
            <Row label="Tax" value={formatPrice(order.tax)} />
            <div className="my-3 h-px bg-white/10" />
            <Row label={<span className="font-display">Total</span>} value={<span className="font-display">{formatPrice(order.total)}</span>} />
            <p className="mt-4 text-xs text-ink-300">
              Payment: <span className="text-paper">{order.paymentMethod.toUpperCase()}</span> ·{' '}
              <span className={cx(order.paymentStatus === 'paid' ? 'text-emerald-300' : 'text-paper')}>{order.paymentStatus}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm">
            <h3 className="font-display text-lg mb-3">Shipping address</h3>
            <p className="font-medium">{order.shipping.fullName}</p>
            <p className="text-ink-200">{order.shipping.line1}{order.shipping.line2 ? `, ${order.shipping.line2}` : ''}</p>
            <p className="text-ink-200">{order.shipping.city}, {order.shipping.postalCode}, {order.shipping.country}</p>
            <p className="mt-2 text-xs text-ink-300">{order.shipping.phone}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className={'flex items-center justify-between py-1 ' + (accent ? 'text-gold' : 'text-ink-200')}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
