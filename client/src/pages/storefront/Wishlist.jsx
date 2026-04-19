import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import { selectWishlistItems, removeWishlist, clearWishlist } from '../../store/slices/wishlistSlice.js';
import { addItem } from '../../store/slices/cartSlice.js';
import { openCart } from '../../store/slices/uiSlice.js';
import { formatPrice } from '../../lib/formatters.js';

export default function Wishlist() {
  const items = useSelector(selectWishlistItems);
  const dispatch = useDispatch();

  const onAdd = (it) => {
    dispatch(addItem({
      productId: it.id, slug: it.slug, name: it.name, price: it.price, image: it.image,
    }));
    dispatch(openCart());
    toast.success('Added to cart');
  };

  if (items.length === 0) {
    return (
      <section className="container-luxe py-24 text-center">
        <Heart size={48} className="mx-auto text-ink-300" />
        <h1 className="mt-6 font-display text-4xl">Your wishlist is empty.</h1>
        <p className="mt-3 text-ink-300">Save the pieces that move you. They'll be waiting.</p>
        <Link to="/shop" className="mt-8 inline-block">
          <Button>Begin browsing</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container-luxe py-12 lg:py-16">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Saved for later</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">Wishlist</h1>
          <p className="mt-2 text-sm text-ink-300">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { dispatch(clearWishlist()); toast('Wishlist cleared'); }}
          className="text-xs uppercase tracking-wider text-ink-300 hover:text-red-400"
        >
          Clear all
        </button>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <li key={it.id} className="group glass overflow-hidden">
            <Link to={`/product/${it.slug}`} className="block aspect-[4/5] overflow-hidden">
              <img src={it.image} alt={it.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            </Link>
            <div className="p-4">
              {it.brand && <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{it.brand}</p>}
              <Link to={`/product/${it.slug}`} className="mt-1 block font-display text-base hover:text-gold transition-colors line-clamp-1">
                {it.name}
              </Link>
              <p className="mt-1 text-sm text-ink-200">{formatPrice(it.price)}</p>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" onClick={() => onAdd(it)} className="flex-1">
                  <ShoppingBag size={14} /> Add
                </Button>
                <button
                  onClick={() => dispatch(removeWishlist(it.id))}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-ink-300 hover:border-red-400/40 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
