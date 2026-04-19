import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Leaf, Sun, Wheat, Star, ShieldCheck,
  Truck, Sparkles, Quote, Clock, Flame, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import { heroSlides, testimonials, categories as mockCategories, products as mockProducts } from '../../lib/mock.js';
import { catalogApi } from '../../lib/api/catalog.js';
import { formatPrice } from '../../lib/formatters.js';

const HomeData = createContext({ products: [], categories: [] });
const useHomeData = () => useContext(HomeData);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let alive = true;
    catalogApi.listProducts({ limit: 24, sort: 'popular' })
      .then((r) => { if (alive) setProducts(r.items || []); })
      .catch(() => { if (alive) setProducts(mockProducts); });
    catalogApi.listCategories()
      .then((r) => { if (alive) setCategories((r.items || r.categories || []).map((c) => ({ ...c, id: c._id || c.id, count: c.productCount ?? c.count ?? 0 }))); })
      .catch(() => { if (alive) setCategories(mockCategories); });
    return () => { alive = false; };
  }, []);

  return (
    <HomeData.Provider value={{ products, categories }}>
      <Hero />
      <TrustStrip />
      <CategoryShowcase />
      <FeaturedGrains />
      <FlashSale />
      <WarmthSection />
      <BestSellers />
      <TestimonialsBand />
    </HomeData.Provider>
  );
}

/* ---------------------------- HERO ---------------------------- */
function Hero() {
  const slide = heroSlides[0];
  const heroImages = [
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1599909533734-fb6e3a3aafe8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80',
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-cream to-cream-100">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-amber-200/30 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(40,25,10,0.6) 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />

      <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-10 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gold backdrop-blur">
            <Sparkles size={12} /> {slide.eyebrow}
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.02] text-ink-800 sm:text-6xl lg:text-7xl">
            {slide.title.split(',').map((part, i, arr) => (
              <span key={i} className={i === arr.length - 1 ? 'block italic text-gold' : 'block'}>
                {part.trim()}{i < arr.length - 1 ? ',' : ''}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-500 sm:text-lg">{slide.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link to={slide.cta.to}>
              <Button size="lg">{slide.cta.label} <ArrowRight size={16} /></Button>
            </Link>
            <Link to={slide.secondaryCta.to} className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 underline-offset-4 hover:text-gold hover:underline">
              {slide.secondaryCta.label} <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {[
              { n: '12K+', l: 'Happy kitchens' },
              { n: '4.9★', l: 'Avg. rating' },
              { n: '48hr', l: 'Fast dispatch' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display text-2xl text-ink-800">{s.n}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-400">{s.l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          className="lg:col-span-6"
        >
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-ink-900/5">
              <img src={heroImages[0]} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -left-6 top-12 hidden h-28 w-28 overflow-hidden rounded-full ring-4 ring-white shadow-xl sm:block"
            >
              <img src={heroImages[1]} alt="" className="h-full w-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -right-4 top-1/2 hidden h-24 w-24 overflow-hidden rounded-full ring-4 ring-white shadow-xl sm:block"
            >
              <img src={heroImages[2]} alt="" className="h-full w-full object-cover" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------- TRUST STRIP -------------------------- */
function TrustStrip() {
  const items = [
    { icon: Truck, title: 'Free shipping', body: 'Orders above ₹999' },
    { icon: ShieldCheck, title: 'Secure checkout', body: 'UPI · Cards · COD' },
    { icon: Leaf, title: 'Farm fresh', body: 'Sourced across India' },
    { icon: Sparkles, title: 'Hand-graded', body: 'Quality you can taste' },
  ];
  return (
    <section className="border-y border-ink-100 bg-white">
      <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
              <it.icon size={18} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink-800">{it.title}</p>
              <p className="text-[11px] text-ink-400">{it.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------- CATEGORY SHOWCASE ----------------------- */
function CategoryShowcase() {
  const { categories } = useHomeData();
  const list = (categories.length ? categories : mockCategories).slice(0, 5);
  if (list.length === 0) return null;
  return (
    <section className="container py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-gold">Shop by Aisle</p>
          <h2 className="mt-2 font-display text-4xl text-ink-800 sm:text-5xl">A pantry, beautifully curated.</h2>
        </div>
        <Link to="/shop" className="text-sm font-medium text-ink-700 underline-offset-4 hover:text-gold hover:underline">
          See all aisles →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2 lg:gap-5">
        {list.map((c, i) => (
          <Link
            key={c.id}
            to={`/shop?category=${c.slug}`}
            className={[
              'group relative block overflow-hidden rounded-3xl bg-ink-700',
              i === 0 ? 'lg:col-span-2 lg:row-span-2' : 'aspect-[4/3]',
            ].join(' ')}
          >
            <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
              <div>
                <p className="font-display text-xl text-white sm:text-2xl">{c.name}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cream/70 mt-1">{c.count} products</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-ink-800 transition group-hover:bg-gold group-hover:text-white">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* -------------------------- FEATURED ----------------------------- */
function FeaturedGrains() {
  const { products } = useHomeData();
  const list = (products.filter((p) => p.isFeatured).slice(0, 3));
  const fallback = products.slice(0, 3);
  const show = list.length ? list : fallback;
  if (show.length === 0) return null;
  return (
    <section className="bg-cream-100/60 py-20">
      <div className="container">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-gold">Featured Grains</p>
            <h2 className="mt-2 font-display text-4xl text-ink-800 sm:text-5xl">Pantry essentials, perfected.</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-ink-700 underline-offset-4 hover:text-gold hover:underline">
            Browse the full harvest →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {show.map((p) => (
            <ProductCard key={p.id} product={p} variant="featured" />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- FLASH SALE ---------------------------- */
function FlashSale() {
  const { products } = useHomeData();
  const sale = useMemo(() => products.filter((p) => p.compareAt && p.compareAt > p.price).slice(0, 4), [products]);
  const [t, setT] = useState({ h: 6, m: 32, s: 18 });
  useEffect(() => {
    const id = setInterval(() => {
      setT((p) => {
        let { h, m, s } = p;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  if (sale.length === 0) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <section className="container py-20">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-800 via-ink-700 to-ink-900 p-8 text-white shadow-2xl sm:p-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-200">
              <Flame size={12} /> Flash Harvest
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Limited drop — ends today.</h2>
            <p className="mt-3 max-w-md text-cream/70">Everyday Indian staples up to 18% off. When the timer ends, the prices return.</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gold-200" />
            {[
              { v: t.h, l: 'hrs' }, { v: t.m, l: 'min' }, { v: t.s, l: 'sec' },
            ].map((u, i, arr) => (
              <div key={u.l} className="flex items-center gap-2">
                <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur">
                  <p className="font-display text-2xl tabular-nums leading-none">{pad(u.v)}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-widest text-cream/60">{u.l}</p>
                </div>
                {i < arr.length - 1 && <span className="text-cream/40">:</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sale.map((p) => {
            const off = Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
            return (
              <Link key={p.id} to={`/product/${p.slug}`} className="group relative overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:ring-gold/40">
                <div className="aspect-square overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">-{off}%</span>
                <div className="p-4">
                  <p className="font-display text-base truncate">{p.name}</p>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span className="font-display text-lg text-gold-200">{formatPrice(p.price)}</span>
                    <span className="text-xs text-cream/50 line-through">{formatPrice(p.compareAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------- WARMTH ------------------------------ */
function WarmthSection() {
  const { products } = useHomeData();
  const featured = products.filter((p) => p.isFeatured);
  const pool = featured.length >= 4 ? featured : products;
  const tiles = pool.slice(3, 7);
  const left = tiles[0];
  const right = tiles.slice(1, 4);
  if (!left) return null;
  return (
    <section className="bg-cream-100 py-20">
      <div className="container grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-gold">Warmth & Vibrancy</p>
          <h2 className="mt-3 font-display text-4xl text-ink-800 sm:text-5xl">Sun-soaked spice, straight from Indian farms.</h2>
          <p className="mt-5 max-w-md text-ink-500">
            Every jar is traceable to a single farm. We work directly with growers across Kerala, Kashmir, Rajasthan and beyond —
            keeping harvests small, prices fair, and flavour at its peak.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Leaf, title: 'Farm to Kitchen', body: 'No blending. No filler. Just the farm and the field.' },
              { icon: Sun, title: 'Sun-Dried', body: 'Slowly cured to preserve essential oils and aroma.' },
              { icon: Wheat, title: 'Small Batch', body: 'Bottled within weeks of harvest. Always fresh.' },
            ].map(({ icon: Ico, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gold/10 text-gold">
                  <Ico size={16} />
                </span>
                <div>
                  <p className="font-display text-lg text-ink-800">{title}</p>
                  <p className="text-sm text-ink-500">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link to="/shop?category=spices"><Button>Explore the spice route <ArrowRight size={16} /></Button></Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Link to={`/product/${left.slug}`} className="group relative col-span-2 block overflow-hidden rounded-3xl bg-ink-700 sm:col-span-2">
              <img src={left.images[0]} alt={left.name} className="h-full max-h-[340px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold-200">Editor's Pick</p>
                <p className="mt-1 font-display text-2xl text-white">{left.name}</p>
                <p className="mt-1 text-sm text-cream/80">{left.brand}</p>
              </div>
            </Link>
            {right.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group relative block overflow-hidden rounded-3xl bg-cream-200">
                <div className="aspect-[4/5]">
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent p-4">
                  <p className="font-display text-base text-white">{p.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold-200">{p.brand}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------ BEST SELLERS --------------------------- */
function BestSellers() {
  const { products } = useHomeData();
  const filtered = products.filter((p) => p.isBestSeller).slice(0, 4);
  const list = filtered.length ? filtered : products.slice(0, 4);
  if (list.length === 0) return null;
  return (
    <section className="container py-20">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-gold">Most Loved</p>
          <h2 className="mt-2 font-display text-4xl text-ink-800 sm:text-5xl">Best sellers this season.</h2>
        </div>
        <Link to="/shop?sort=popular" className="text-sm font-medium text-ink-700 underline-offset-4 hover:text-gold hover:underline">
          See ranking →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------ TESTIMONIALS --------------------------- */
function TestimonialsBand() {
  const [i, setI] = useState(0);
  const items = testimonials;
  useEffect(() => {
    const id = setInterval(() => setI((x) => (x + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length]);
  const t = items[i];
  return (
    <section className="bg-ink-800 py-24 text-white">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <Quote size={40} className="mx-auto text-gold/60" />
          <motion.blockquote
            key={t.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 font-display text-2xl leading-snug sm:text-3xl"
          >
            "{t.body}"
          </motion.blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-gold/40" />
            <div className="text-left">
              <p className="font-medium text-white">{t.name}</p>
              <p className="text-xs text-cream/60">{t.role}</p>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={() => setI((i - 1 + items.length) % items.length)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-gold/30 transition">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {items.map((_, idx) => (
                <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-8 bg-gold' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>
            <button onClick={() => setI((i + 1) % items.length)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-gold/30 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- NEWSLETTER --------------------------- */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  return (
    <section className="container py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream-100 via-white to-cream-50 p-10 shadow-card ring-1 ring-ink-100 sm:p-14">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">Join the harvest</p>
            <h2 className="mt-3 font-display text-4xl text-ink-800 sm:text-5xl">Recipes, drops & 10% off your first order.</h2>
            <p className="mt-4 max-w-md text-ink-500">Subscribe for seasonal recipes, new-harvest alerts, and member-only pricing. Unsubscribe anytime.</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@kitchen.com"
              className="input flex-1 !py-3.5"
            />
            <Button size="lg" type="submit" disabled={done}>
              {done ? 'Subscribed ✓' : <>Subscribe <ArrowRight size={16} /></>}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
