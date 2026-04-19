import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { addItem } from '../../store/slices/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice.js';
import { cx, formatPrice } from '../../lib/formatters.js';

export default function ProductCard({ product, view = 'grid', variant = 'shop' }) {
  const dispatch = useDispatch();
  const wished = useSelector(selectIsWishlisted(product.id));

  const onAdd = (e) => {
    e.preventDefault();
    dispatch(addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      variant: product.variants?.[0],
      slug: product.slug,
    }));
    toast.success('Added to cart');
  };
  const onWish = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist({
      id: product.id, slug: product.slug, name: product.name,
      price: product.price, image: product.images?.[0], brand: product.brand,
    }));
  };

  const origin = product.brand;
  const unit = product.variants?.[0]?.label;

  // Compact "Featured Grain" card used on the homepage — rounded tile,
  // image on top, price + small + button along the bottom.
  if (variant === 'featured') {
    return (
      <Link to={`/product/${product.slug}`} className="group block bg-white rounded-2xl shadow-card border border-ink-100 overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
        <div className="aspect-square overflow-hidden bg-cream-200">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          {origin && <p className="text-[10px] uppercase tracking-[0.22em] text-ink-400">{origin}</p>}
          <h3 className="mt-2 font-display text-xl text-ink-800">{product.name}</h3>
          <p className="mt-2 text-sm text-ink-500 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gold font-medium">{formatPrice(product.price)}{unit ? ` / ${shortUnit(unit)}` : ''}</p>
            <button
              onClick={onAdd}
              className="grid h-9 w-9 place-items-center rounded-full border border-ink-200 text-ink-600 hover:border-gold hover:text-gold transition"
              aria-label="Add to cart"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // List view used by Catalog
  if (view === 'list') {
    return (
      <Link to={`/product/${product.slug}`} className="glass group flex gap-5 p-4 transition hover:border-gold/40">
        <img src={product.images[0]} alt={product.name} className="h-32 w-32 sm:h-40 sm:w-40 rounded-xl object-cover" loading="lazy" />
        <div className="flex flex-1 flex-col">
          {origin && <p className="text-[10px] uppercase tracking-[0.22em] text-ink-400">{origin}</p>}
          <h3 className="font-display text-xl mt-1 text-ink-800 group-hover:text-gold transition-colors">{product.name}</h3>
          <p className="mt-1 text-sm text-ink-500 line-clamp-2">{product.description}</p>
          <div className="mt-auto flex items-end justify-between gap-3">
            <p className="text-gold font-medium">{formatPrice(product.price)}</p>
            <button onClick={onAdd} className="btn-primary"><ShoppingCart size={14} /> Add to Cart</button>
          </div>
        </div>
      </Link>
    );
  }

  // Default catalog grid card — best-seller ribbon, image, info, full-width
  // Add-to-Cart button at the bottom (matches the "Premium Rice" screen).
  return (
    <Link to={`/product/${product.slug}`} className="group flex flex-col bg-white rounded-2xl border border-ink-100 shadow-card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.isBestSeller && (
          <span className="absolute top-3 left-3 rounded-md bg-cream-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-700 shadow-sm">
            Best Seller
          </span>
        )}
        {product.compareAt > product.price && (
          <span className="absolute top-3 right-3 rounded-md bg-gold px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            -{Math.round((1 - product.price / product.compareAt) * 100)}%
          </span>
        )}
        <button
          onClick={onWish}
          aria-label="Wishlist"
          className={cx(
            'absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 backdrop-blur shadow-sm transition opacity-0 group-hover:opacity-100',
            wished ? 'text-gold' : 'text-ink-500 hover:text-gold'
          )}
        >
          <Heart size={14} className={cx(wished && 'fill-gold')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg leading-snug text-ink-800 group-hover:text-gold transition-colors">{product.name}</h3>
          <p className="font-display text-lg text-gold whitespace-nowrap">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-1.5 text-xs text-ink-500 line-clamp-2">{product.description}</p>
        <button
          onClick={onAdd}
          className="mt-auto pt-4"
        >
          <span className="flex w-full items-center justify-center gap-2 rounded-md bg-gold py-2.5 text-sm font-medium text-white transition hover:bg-gold-600">
            <ShoppingCart size={14} /> Add to Cart
          </span>
        </button>
      </div>
    </Link>
  );
}

function shortUnit(label = '') {
  // Derive a tiny price-suffix unit ("lb", "kg", "g") from the variant label.
  const m = String(label).match(/(kg|g|lb|ml|oz|grams?|gram)/i);
  return m ? m[1].toLowerCase() : 'unit';
}
