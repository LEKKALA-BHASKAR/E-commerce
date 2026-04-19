import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { checkoutApi } from '../../lib/api/checkout.js';
import { formatPrice, formatDate } from '../../lib/formatters.js';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    checkoutApi.getOrder(id).then(({ order }) => alive && setOrder(order))
      .catch((e) => alive && setError(e?.response?.data?.message || 'Order not found'));
    return () => { alive = false; };
  }, [id]);

  if (error) {
    return (
      <section className="container-luxe py-24 text-center">
        <h1 className="font-display text-3xl">{error}</h1>
        <Link to="/account/orders" className="mt-6 inline-block">
          <Button variant="ghost">View all orders</Button>
        </Link>
      </section>
    );
  }
  if (!order) {
    return <section className="container-luxe py-24 text-center text-ink-300">Loading…</section>;
  }

  const paid = order.paymentStatus === 'paid' || order.paymentMethod === 'cod';

  return (
    <section className="container-luxe py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
      >
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
            <CheckCircle2 size={32} />
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold">
            {paid ? 'Order confirmed' : 'Awaiting payment'}
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Thank you.</h1>
          <p className="mt-3 text-ink-300">
            Order <span className="text-paper">{order.orderNumber}</span> placed on {formatDate(order.createdAt)}.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <p className="mb-4 text-xs uppercase tracking-wider text-ink-300 flex items-center gap-2">
            <Package size={12} /> Items
          </p>
          <ul className="divide-y divide-white/5">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <img src={it.image} alt={it.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-ink-300">{it.variantLabel ? `${it.variantLabel} · ` : ''}Qty {it.qty}</p>
                </div>
                <p className="text-sm">{formatPrice(it.subtotal)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-300">Shipping to</p>
              <p className="mt-1 font-medium">{order.shipping.fullName}</p>
              <p className="text-sm text-ink-200">{order.shipping.line1}{order.shipping.line2 ? `, ${order.shipping.line2}` : ''}</p>
              <p className="text-sm text-ink-200">{order.shipping.city}, {order.shipping.postalCode}, {order.shipping.country}</p>
            </div>
            <div className="text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label="Discount" value={`-${formatPrice(order.discount)}`} accent />}
              <Row label="Shipping" value={order.shippingFee ? formatPrice(order.shippingFee) : 'Free'} />
              <Row label="Tax" value={formatPrice(order.tax)} />
              <div className="my-2 h-px bg-white/10" />
              <Row label={<span className="font-display">Total</span>} value={<span className="font-display">{formatPrice(order.total)}</span>} />
              <p className="mt-3 text-xs text-ink-300">
                Payment: <span className="text-paper">{order.paymentMethod.toUpperCase()}</span> · {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/shop"><Button>Continue shopping <ArrowRight size={16} /></Button></Link>
          <Link to={`/account/orders/${order.id}`}><Button variant="ghost">View order details</Button></Link>
        </div>
      </motion.div>
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
