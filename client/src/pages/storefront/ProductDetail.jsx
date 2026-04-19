import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Minus, Plus, ShoppingBag, Truck, Shield, RotateCw, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { catalogApi } from '../../lib/api/catalog.js';
import { addItem } from '../../store/slices/cartSlice.js';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice.js';
import { pushViewed } from '../../store/slices/recentlyViewedSlice.js';
import { selectUser } from '../../store/slices/authSlice.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import PriceTag from '../../components/ui/PriceTag.jsx';
import Rating from '../../components/ui/Rating.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import SectionHeading from '../../components/ui/SectionHeading.jsx';
import Button from '../../components/ui/Button.jsx';
import { cx, formatPrice, formatDate } from '../../lib/formatters.js';

const TABS = ['Details', 'Reviews', 'Shipping & Returns'];

export default function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('Details');
  const [reviews, setReviews] = useState([]);
  const wished = useSelector(selectIsWishlisted(product?.id));

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setActiveImage(0); setVariantIdx(0); setQty(1); setTab('Details');
    Promise.all([
      catalogApi.getProduct(slug),
      catalogApi.getRelated(slug).catch(() => ({ items: [] })),
      catalogApi.listReviews(slug).catch(() => ({ reviews: [] })),
    ]).then(([p, r, rv]) => {
      if (!alive) return;
      setProduct(p.product);
      setRelated(r.items || []);
      setReviews(rv.reviews || []);
      if (p.product) dispatch(pushViewed(p.product.id));
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug, dispatch]);

  const variant = product?.variants?.[variantIdx];
  const inStock = (variant?.stock ?? product?.stock ?? 0) > 0;
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    return product.price + (variant?.priceDelta || 0);
  }, [product, variant]);

  const onAdd = () => {
    if (!product || !inStock) return;
    dispatch(addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: effectivePrice,
      image: product.images?.[0],
      variant,
      qty,
    }));
    toast.success(`${product.name} added to cart`);
  };

  const onBuyNow = () => { onAdd(); navigate('/checkout'); };

  if (loading) return <ProductSkeleton />;
  if (!product) {
    return (
      <div className="container py-24 text-center">
        <p className="font-display text-3xl mb-3 text-ink-800">We couldn't find that product.</p>
        <Link to="/shop" className="btn-primary inline-flex">Browse the pantry</Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-ink-500 mb-6">
        <Link to="/" className="hover:text-gold">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-gold">Shop</Link>
        {product.categoryName && <>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.categorySlug}`} className="hover:text-gold">{product.categoryName}</Link>
        </>}
        <ChevronRight size={12} />
        <span className="text-ink-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <Gallery images={product.images || []} active={activeImage} setActive={setActiveImage} alt={product.name} />

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.brand}</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-2 leading-tight">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <Rating value={product.rating || 0} count={product.reviewsCount || 0} />
            {product.badges?.map((b) => (
              <span key={b} className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gold">{b}</span>
            ))}
          </div>
          <PriceTag price={effectivePrice} compareAt={product.compareAt} className="mt-5 text-xl" />

          <p className="mt-6 text-ink-600 leading-relaxed">{product.description}</p>

          {/* Variant picker */}
          {product.variants?.length > 0 && (
            <div className="mt-7">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-500 mb-3">
                {variant?.color ? 'Colour' : 'Option'}: <span className="text-ink-800 normal-case tracking-normal">{variant?.label}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => (
                  <button
                    key={v.sku}
                    onClick={() => setVariantIdx(i)}
                    disabled={v.stock <= 0}
                    title={v.label}
                    className={cx(
                      'px-3 h-10 rounded-full border text-sm transition flex items-center gap-2',
                      variantIdx === i ? 'border-gold bg-gold/10 text-gold' : 'border-ink-200 hover:border-gold/40',
                      v.stock <= 0 && 'opacity-40 line-through cursor-not-allowed'
                    )}
                  >
                    {v.color && <span className="inline-block h-4 w-4 rounded-full border border-ink-300" style={{ background: v.color }} />}
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full border border-ink-200 h-12">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 h-full hover:text-gold"><Minus size={14} /></button>
              <span className="px-4 font-display">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 h-full hover:text-gold"><Plus size={14} /></button>
            </div>
            <Button onClick={onAdd} size="lg" disabled={!inStock} className="flex-1 min-w-[180px]">
              <ShoppingBag size={16} /> {inStock ? 'Add to cart' : 'Out of stock'}
            </Button>
            <Button onClick={onBuyNow} variant="outline" size="lg" disabled={!inStock}>Buy now</Button>
            <button onClick={() => dispatch(toggleWishlist({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0], brand: product.brand }))} className={cx('h-12 w-12 rounded-full border grid place-items-center transition', wished ? 'border-gold bg-gold/10 text-gold' : 'border-ink-200 hover:border-gold/40')} aria-label="Wishlist">
              <Heart size={16} className={cx(wished && 'fill-gold')} />
            </button>
          </div>

          {/* Stock hint */}
          {inStock && (variant?.stock ?? product.stock) <= 5 && (
            <p className="mt-4 text-xs text-gold">Only {variant?.stock ?? product.stock} left — selling fast.</p>
          )}

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <Trust icon={<Truck size={16} />} label="Complimentary shipping" />
            <Trust icon={<RotateCw size={16} />} label="Sustainably farmed" />
            <Trust icon={<Shield size={16} />} label="Quality guaranteed" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-t border-ink-200 pt-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx('px-4 py-2 rounded-full text-sm border transition', tab === t ? 'border-gold text-gold bg-gold/10' : 'border-ink-200 hover:border-gold/40')}
            >{t}</button>
          ))}
        </div>

        {tab === 'Details' && <DetailsTab product={product} />}
        {tab === 'Reviews' && (
          <ReviewsTab
            slug={slug}
            product={product}
            reviews={reviews}
            user={user}
            onPosted={(r) => setReviews((rs) => [r, ...rs])}
          />
        )}
        {tab === 'Shipping & Returns' && <ShippingTab />}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Curated companions" title="Pairs beautifully with" />
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Gallery({ images, active, setActive, alt }) {
  if (!images?.length) return <div className="aspect-square glass rounded-2xl" />;
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl glass group">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cx('aspect-square rounded-xl overflow-hidden border-2 transition', active === i ? 'border-gold' : 'border-transparent hover:border-ink-300')}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Trust({ icon, label }) {
  return (
    <div className="glass rounded-xl p-3 flex flex-col items-center gap-1.5 text-xs text-ink-600">
      <span className="text-gold">{icon}</span>
      {label}
    </div>
  );
}

function DetailsTab({ product }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="font-display text-xl mb-3 text-ink-800">The Story</h3>
        <p className="text-ink-600 leading-relaxed">{product.description}</p>
        {product.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span key={t} className="rounded-full border border-ink-200 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-500">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-display text-xl mb-3 text-ink-800">Characteristics</h3>
        <dl className="text-sm divide-y divide-ink-100">
        <Row k="Origin" v={product.brand} />
          <Row k="Category" v={product.categoryName} />
          <Row k="SKU" v={product.variants?.[0]?.sku || product.slug.toUpperCase()} />
          <Row k="In stock" v={`${product.stock} unit${product.stock === 1 ? '' : 's'}`} />
        </dl>
      </div>
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex justify-between py-2.5">
      <dt className="text-ink-500">{k}</dt>
      <dd className="text-ink-800">{v}</dd>
    </div>
  );
}

function ShippingTab() {
  return (
    <div className="grid md:grid-cols-3 gap-6 text-sm text-ink-600">
      <div>
      <div>
        <h4 className="font-display text-lg text-ink-800 mb-2">Shipping</h4>
        <p>Complimentary express delivery on all orders over $75. Insulated and freshness-sealed. Most orders ship within 24 hours from our warehouse.</p>
      </div>
      <div>
        <h4 className="font-display text-lg text-ink-800 mb-2">Returns</h4>
        <p>Unopened pantry goods may be returned within 14 days for a full refund. We provide pre-paid labels for every order.</p>
      </div>
      <div>
        <h4 className="font-display text-lg text-ink-800 mb-2">Sourcing</h4>
        <p>Every Sahara purchase is single-origin, traceable to the farm. We work directly with growers — fair, transparent, and seasonal.</p>
      </div>
      </div>
    </div>
  );
}

function ReviewsTab({ slug, product, reviews, user, onPosted }) {
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await catalogApi.createReview(slug, { rating, title, body });
      onPosted(res.review);
      toast.success('Thank you for your review.');
      setShowForm(false); setTitle(''); setBody(''); setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post review');
    } finally { setBusy(false); }
  };

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-10">
      <aside>
        <div className="glass rounded-2xl p-6 text-center">
          <p className="font-display text-5xl text-gold">{(product.rating || 0).toFixed(1)}</p>
          <Rating value={product.rating || 0} className="justify-center mt-2" />
          <p className="mt-2 text-xs text-ink-500">{product.reviewsCount || 0} review{product.reviewsCount === 1 ? '' : 's'}</p>
        </div>
        {user ? (
          <button onClick={() => setShowForm((s) => !s)} className="btn-outline w-full mt-4">
            {showForm ? 'Close' : 'Write a review'}
          </button>
        ) : (
          <Link to="/login" className="btn-outline w-full mt-4 text-center block">Sign in to review</Link>
        )}
      </aside>
      <div>
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-5 mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    <Star size={20} className={n <= rating ? 'fill-gold text-gold' : 'text-ink-400'} />
                  </button>
                ))}
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mb-3" placeholder="Title (optional)" maxLength={120} />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} className="input min-h-[120px] resize-y" placeholder="Tell us what you think…" maxLength={4000} />
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                <Button type="submit" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {reviews.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-ink-500">Be the first to share your thoughts.</div>
        ) : (
          <ul className="space-y-5">
            {reviews.map((r) => (
              <li key={r._id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display">{r.authorName}</p>
                    <Rating value={r.rating} className="mt-0.5" />
                  </div>
                  <p className="text-xs text-ink-500">{formatDate(r.createdAt)}</p>
                </div>
                {r.title && <p className="mt-3 font-display text-lg">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-ink-600 leading-relaxed">{r.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container py-10">
      <div className="grid lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-12 w-3/4 rounded" />
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
