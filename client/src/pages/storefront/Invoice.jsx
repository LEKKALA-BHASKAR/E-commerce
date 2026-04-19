import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { checkoutApi } from '../../lib/api/checkout.js';
import { formatPrice, formatDate } from '../../lib/formatters.js';

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    checkoutApi.getOrder(id)
      .then((d) => { if (alive) setOrder(d.order || d); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const due = useMemo(() => {
    if (!order?.createdAt) return null;
    const d = new Date(order.createdAt);
    d.setDate(d.getDate() + 14);
    return d.toISOString();
  }, [order]);

  if (loading) {
    return (
      <div className="container py-24 text-center text-ink-500">Loading invoice…</div>
    );
  }

  if (!order) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-3xl text-ink-800">Invoice not found.</p>
        <Link to="/account/orders" className="btn-primary mt-6 inline-flex">Back to orders</Link>
      </div>
    );
  }

  const sub = Number(order.subtotal ?? 0);
  const ship = Number(order.shippingFee ?? order.shipping ?? 0);
  const tax = Number(order.tax ?? 0);
  const total = Number(order.total ?? sub + ship + tax);

  return (
    <div className="bg-cream py-10">
      {/* Toolbar — hidden in print */}
      <div className="container mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-gold">
          <ArrowLeft size={14} /> Back to Orders
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => window.print()}>
            <Download size={14} /> Download PDF
          </Button>
          <Button onClick={() => window.print()}>
            <Printer size={14} /> Print Invoice
          </Button>
        </div>
      </div>

      <article className="container">
        <div className="mx-auto max-w-4xl rounded-3xl border border-ink-100 bg-white p-10 shadow-card sm:p-14 print:border-0 print:shadow-none print:rounded-none print:p-6">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-ink-100 pb-8">
            <div>
              <p className="font-display text-3xl italic text-gold">Sahara</p>
              <p className="mt-3 text-sm text-ink-500">
                124 Oasis Avenue<br />
                Phoenix, AZ 85001<br />
                hello@saharagroceries.com
              </p>
            </div>
            <div className="text-right">
              <p className="eyebrow text-ink-400">Invoice</p>
              <p className="mt-2 font-display text-3xl text-ink-800">#{order.orderNumber || order.id}</p>
              <dl className="mt-4 space-y-1 text-sm text-ink-500">
                <div className="flex justify-end gap-3">
                  <dt>Issued:</dt>
                  <dd className="text-ink-700">{formatDate(order.createdAt)}</dd>
                </div>
                {due && (
                  <div className="flex justify-end gap-3">
                    <dt>Due:</dt>
                    <dd className="text-ink-700">{formatDate(due)}</dd>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <dt>Order:</dt>
                  <dd className="text-ink-700">{order.orderNumber || order.id}</dd>
                </div>
              </dl>
            </div>
          </header>

          {/* Amount Due band */}
          <div className="mt-8 rounded-2xl bg-gold/10 p-5 text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">Amount Due</p>
            <p className="font-display text-4xl text-gold">{formatPrice(total)}</p>
          </div>

          {/* Parties */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow text-ink-400">Billed To</p>
              <p className="mt-2 font-display text-lg text-ink-800">{order.customer?.name || order.shipping?.fullName}</p>
              <p className="text-sm text-ink-500">{order.customer?.email}</p>
            </div>
            <div>
              <p className="eyebrow text-ink-400">Shipped To</p>
              <p className="mt-2 font-display text-lg text-ink-800">{order.shipping?.fullName}</p>
              <p className="text-sm text-ink-500">
                {order.shipping?.line1}{order.shipping?.line2 ? `, ${order.shipping.line2}` : ''}<br />
                {order.shipping?.city}{order.shipping?.state ? `, ${order.shipping.state}` : ''} {order.shipping?.postalCode}<br />
                {order.shipping?.country}
              </p>
            </div>
          </div>

          {/* Line items */}
          <table className="mt-10 w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wider text-ink-400">
                <th className="py-3">Item</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Rate</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {(order.items || []).map((it, i) => (
                <tr key={i}>
                  <td className="py-4">
                    <p className="font-medium text-ink-800">{it.name}</p>
                    {it.sku && <p className="text-xs text-ink-400">SKU: {it.sku}</p>}
                  </td>
                  <td className="py-4 text-center text-ink-600">{it.qty}</td>
                  <td className="py-4 text-right text-ink-600">{formatPrice(it.price)}</td>
                  <td className="py-4 text-right text-ink-800">{formatPrice(it.price * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-cream-100 p-5 text-sm text-ink-600">
              <p className="font-display text-base text-ink-800">Payment Notes</p>
              <p className="mt-2 text-xs leading-relaxed">
                Wire transfer or major card accepted. Quote invoice number on payment. Late fees may apply after 14 days.
              </p>
              <p className="mt-3 text-xs">
                <strong className="text-ink-800">Bank:</strong> Sahara Trading Co.<br />
                <strong className="text-ink-800">Acct:</strong> 0042-9981-7740<br />
                <strong className="text-ink-800">Routing:</strong> 122000661
              </p>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Subtotal" value={formatPrice(sub)} />
              <Row label="Shipping" value={ship ? formatPrice(ship) : 'Free'} />
              <Row label="Tax" value={formatPrice(tax)} />
              <div className="my-3 h-px bg-ink-200/60" />
              <Row
                label={<span className="font-display text-lg text-ink-800">Total Due</span>}
                value={<span className="font-display text-lg text-gold">{formatPrice(total)}</span>}
              />
            </dl>
          </div>

          <footer className="mt-10 border-t border-ink-100 pt-6 text-center text-sm text-ink-500">
            Thank you for your business.
          </footer>
        </div>
      </article>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-ink-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
