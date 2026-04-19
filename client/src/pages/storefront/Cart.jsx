import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Tag, X, ShoppingBag, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import {
  selectCartItems, selectCartTotals, selectCoupon,
  removeItem, updateQty, applyCoupon, removeCoupon,
} from '../../store/slices/cartSlice.js';
import { formatPrice } from '../../lib/formatters.js';
import { checkoutApi } from '../../lib/api/checkout.js';

export default function Cart() {
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const coupon = useSelector(selectCoupon);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  if (items.length === 0) {
    return (
      <section className="container py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-ink-300" />
        <h1 className="mt-6 font-display text-4xl text-ink-800">Your cart is empty.</h1>
        <p className="mt-3 text-ink-500">Begin with our sun-baked grains and pantry essentials.</p>
        <Link to="/shop" className="mt-8 inline-block">
          <Button>Shop the harvest</Button>
        </Link>
      </section>
    );
  }

  const onApplyCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    try {
      const { coupon: c } = await checkoutApi.validateCoupon(code.trim(), totals.subtotal);
      dispatch(applyCoupon({ code: c.code, type: c.type, value: c.value }));
      toast.success(`${c.code} applied — ${formatPrice(c.discount)} off`);
      setCode('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  return (
    <section className="container py-12 lg:py-16">
      <header className="mb-10">
        <p className="eyebrow text-gold">Your cart</p>
        <h1 className="mt-3 font-display text-4xl text-ink-800 sm:text-5xl">Your Cart</h1>
        <p className="mt-2 text-ink-500">Review your selected sun-baked goods before checkout. {items.length} item{items.length !== 1 ? 's' : ''}.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <ul className="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-card">
          {items.map((it) => (
            <li key={it.key} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Link to={`/product/${it.slug}`} className="shrink-0">
                <img src={it.image} alt={it.name} className="h-28 w-28 rounded-xl object-cover" loading="lazy" />
              </Link>
              <div className="flex-1">
                <Link to={`/product/${it.slug}`} className="font-display text-lg text-ink-800 hover:text-gold transition-colors">
                  {it.name}
                </Link>
                {it.variant?.label && <p className="mt-1 text-sm text-ink-500">{it.variant.label}</p>}
                <p className="mt-1 text-xs text-ink-400">Unit: {formatPrice(it.price)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-md border border-ink-200 px-1">
                    <button onClick={() => dispatch(updateQty({ key: it.key, qty: it.qty - 1 }))} className="rounded-md p-1.5 text-ink-600 hover:text-gold" aria-label="Decrease">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center text-ink-700">{it.qty}</span>
                    <button onClick={() => dispatch(updateQty({ key: it.key, qty: it.qty + 1 }))} className="rounded-md p-1.5 text-ink-600 hover:text-gold" aria-label="Increase">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => { dispatch(removeItem(it.key)); toast('Removed from cart'); }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
              <p className="font-display text-xl text-ink-800 sm:w-28 sm:text-right">{formatPrice(it.price * it.qty)}</p>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="space-y-6 rounded-2xl border border-ink-100 bg-cream-100 p-6 h-fit shadow-card lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-ink-800">Order Summary</h2>

          {/* Coupon */}
          {coupon ? (
            <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag size={14} className="text-gold" />
                <div>
                  <p className="font-medium">{coupon.code}</p>
                  <p className="text-xs text-ink-300">{coupon.type === 'percent' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}</p>
                </div>
              </div>
              <button onClick={() => { dispatch(removeCoupon()); toast('Coupon removed'); }} className="text-ink-400 hover:text-red-500" aria-label="Remove coupon">
                <X size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={onApplyCoupon} className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="flex-1"
              />
              <Button type="submit" variant="ghost" disabled={applying}>
                {applying ? '…' : 'Apply'}
              </Button>
            </form>
          )}

          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            {totals.discount > 0 && <Row label="Discount" value={`-${formatPrice(totals.discount)}`} accent />}
            <Row label="Shipping" value={totals.shipping ? formatPrice(totals.shipping) : 'Calculated at checkout'} />
            <Row label="Tax (estimated)" value={formatPrice(totals.tax)} />
            <div className="my-3 h-px bg-ink-200/60" />
            <Row
              label={<span className="font-display text-lg text-ink-800">Total</span>}
              value={<span className="font-display text-lg text-gold">{formatPrice(totals.total)}</span>}
            />
          </div>

          <Button onClick={() => navigate('/checkout')} className="w-full">
            Proceed to Checkout <ArrowRight size={16} />
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-500">
            <Lock size={12} /> Secure checkout guaranteed.
          </p>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className={'flex items-center justify-between ' + (accent ? 'text-gold' : 'text-ink-600')}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
