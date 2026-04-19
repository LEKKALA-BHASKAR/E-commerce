import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { checkoutApi } from '../../lib/api/checkout.js';
import { formatPrice, formatDate, cx } from '../../lib/formatters.js';

const STATUS_TONE = {
  pending: 'text-ink-300 border-white/15',
  paid: 'text-gold border-gold/40',
  processing: 'text-blue-300 border-blue-300/30',
  shipped: 'text-blue-300 border-blue-300/30',
  delivered: 'text-emerald-300 border-emerald-300/30',
  cancelled: 'text-red-300 border-red-300/30',
  refunded: 'text-ink-300 border-white/15',
};

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    checkoutApi.listOrders().then(({ orders }) => setOrders(orders)).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <section className="container-luxe py-16 text-center text-ink-300">Loading…</section>;
  if (orders.length === 0) {
    return (
      <section className="container-luxe py-24 text-center">
        <Package size={48} className="mx-auto text-ink-300" />
        <h1 className="mt-6 font-display text-4xl">No orders yet.</h1>
        <p className="mt-3 text-ink-300">When you place an order, it will appear here.</p>
        <Link to="/shop" className="mt-8 inline-block"><Button>Begin shopping</Button></Link>
      </section>
    );
  }

  return (
    <section className="container-luxe py-12 lg:py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Account</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Your orders</h1>
      </header>

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/account/orders/${o.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition hover:border-gold/40"
            >
              <div className="flex -space-x-2">
                {o.items.slice(0, 3).map((it, i) => (
                  <img key={i} src={it.image} alt="" className="h-12 w-12 rounded-lg border-2 border-ink-900 object-cover" />
                ))}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg">{o.orderNumber}</p>
                <p className="text-xs text-ink-300">
                  {formatDate(o.createdAt)} · {o.items.length} item{o.items.length !== 1 ? 's' : ''} · {o.paymentMethod.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg">{formatPrice(o.total)}</p>
                <span className={cx('mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider', STATUS_TONE[o.status] || STATUS_TONE.pending)}>
                  {o.status}
                </span>
              </div>
              <ChevronRight size={18} className="text-ink-300 group-hover:text-gold" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
