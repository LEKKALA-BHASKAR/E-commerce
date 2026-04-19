import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import Drawer from '../ui/Drawer.jsx';
import Button from '../ui/Button.jsx';
import { closeCart } from '../../store/slices/uiSlice.js';
import { selectCartItems, selectCartTotals, removeItem, updateQty } from '../../store/slices/cartSlice.js';
import { formatPrice } from '../../lib/formatters.js';

export default function CartDrawer() {
  const open = useSelector((s) => s.ui.cartDrawerOpen);
  const items = useSelector(selectCartItems);
  const totals = useSelector(selectCartTotals);
  const dispatch = useDispatch();

  return (
    <Drawer open={open} onClose={() => dispatch(closeCart())} title={`Cart · ${items.length} item${items.length !== 1 ? 's' : ''}`}>
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="font-display text-xl">Your bag is empty.</p>
          <p className="text-sm text-ink-300">Start with our most coveted pieces.</p>
          <Link to="/shop" onClick={() => dispatch(closeCart())}>
            <Button>Discover the edit</Button>
          </Link>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-white/5 px-5">
            {items.map((it) => (
              <li key={it.key} className="flex gap-4 py-5">
                <img src={it.image} alt={it.name} className="h-20 w-20 rounded-xl object-cover" loading="lazy" />
                <div className="flex-1">
                  <p className="font-display text-sm">{it.name}</p>
                  {it.variant?.label && <p className="text-xs text-ink-300">{it.variant.label}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => dispatch(updateQty({ key: it.key, qty: it.qty - 1 }))} className="rounded-full border border-white/10 p-1 hover:border-gold hover:text-gold">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm w-6 text-center">{it.qty}</span>
                    <button onClick={() => dispatch(updateQty({ key: it.key, qty: it.qty + 1 }))} className="rounded-full border border-white/10 p-1 hover:border-gold hover:text-gold">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-sm">{formatPrice(it.price * it.qty)}</span>
                  <button onClick={() => dispatch(removeItem(it.key))} className="text-ink-300 hover:text-red-400" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 p-5 space-y-2">
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            {totals.discount > 0 && <Row label="Discount" value={`-${formatPrice(totals.discount)}`} />}
            <Row label="Shipping" value={totals.shipping ? formatPrice(totals.shipping) : 'Free'} />
            <Row label="Tax" value={formatPrice(totals.tax)} />
            <div className="my-3 h-px bg-white/10" />
            <Row label={<span className="font-display text-base">Total</span>} value={<span className="font-display text-base">{formatPrice(totals.total)}</span>} />
            <Link to="/checkout" onClick={() => dispatch(closeCart())} className="block">
              <Button className="mt-3 w-full">
                Checkout <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/cart" onClick={() => dispatch(closeCart())} className="block text-center text-xs text-ink-300 underline-offset-4 hover:text-gold hover:underline mt-2">View full cart</Link>
          </div>
        </>
      )}
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm text-ink-200">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
