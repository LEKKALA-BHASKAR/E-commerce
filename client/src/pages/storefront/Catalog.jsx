import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { catalogApi } from '../../lib/api/catalog.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Drawer from '../../components/ui/Drawer.jsx';
import { cx } from '../../lib/formatters.js';

const SORTS = [
  { v: 'new', label: 'Newest' },
  { v: 'best', label: 'Best sellers' },
  { v: 'rating', label: 'Top rated' },
  { v: 'price-asc', label: 'Price: low to high' },
  { v: 'price-desc', label: 'Price: high to low' },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pages: 0, page: 1, facets: { brands: [] } });
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 9);

  useEffect(() => {
    catalogApi.listCategories().then((d) => setCategories(d.flat || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    catalogApi
      .listProducts({ ...query, page, limit })
      .then((d) => { if (alive) setData(d); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [params]); // eslint-disable-line

  const setQ = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') next.delete(k);
      else next.set(k, String(v));
    });
    // Reset to page 1 on any non-page filter change
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const activeChips = [];
  if (query.category) activeChips.push({ k: 'category', label: categories.find((c) => c.slug === query.category)?.name || query.category });
  if (query.brand) query.brand.split(',').forEach((b) => activeChips.push({ k: 'brand', label: b, value: b }));
  if (query.tag) activeChips.push({ k: 'tag', label: query.tag });
  if (query.inStock) activeChips.push({ k: 'inStock', label: 'In stock' });

  const activeCat = categories.find((c) => c.slug === query.category);
  const heading = activeCat?.name ? `Premium ${activeCat.name}` : query.q ? `Searching “${query.q}”` : 'The Pantry';
  const sub = activeCat
    ? 'Sun-baked quality, sourced from the finest fields.'
    : 'Hand-picked grains, spices, and pantry essentials from around the world.';

  const start = data.total === 0 ? 0 : (data.page - 1) * limit + 1;
  const end = Math.min(data.page * limit, data.total);

  const filters = (
    <FilterPanel categories={categories} brands={data.facets?.brands || []} query={query} setQ={setQ} onClose={() => setFiltersOpen(false)} />
  );

  return (
    <div className="container py-12 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow text-gold">{activeCat ? 'Category' : 'Shop'}</p>
        <h1 className="mt-3 font-display text-4xl text-ink-800 sm:text-5xl">{heading}</h1>
        <p className="mt-3 text-ink-500">{sub}</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 sticky top-24 shadow-card">{filters}</div>
        </aside>

        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setFiltersOpen(true)} className="btn-outline lg:hidden">
                <SlidersHorizontal size={14} /> Filters
              </button>
              <p className="text-sm text-ink-500">
                {loading ? 'Loading…' : `Showing ${start}–${end} of ${data.total} results`}
              </p>
            </div>
            <div className="relative">
              <select
                value={query.sort || 'new'}
                onChange={(e) => setQ({ sort: e.target.value })}
                className="appearance-none rounded-md border border-ink-200 bg-white pl-3 pr-9 py-2 text-sm cursor-pointer focus:border-gold focus:outline-none"
              >
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {activeChips.map((c, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (c.k === 'brand') {
                      const next = (query.brand || '').split(',').filter((b) => b !== c.value).join(',');
                      setQ({ brand: next });
                    } else {
                      setQ({ [c.k]: '' });
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 text-gold px-3 py-1 text-xs hover:bg-gold/20"
                >
                  {c.label} <X size={12} />
                </button>
              ))}
              <button onClick={() => setParams(new URLSearchParams())} className="text-xs text-ink-400 hover:text-gold underline-offset-4 hover:underline">Clear all</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="mt-3 h-4 w-2/3 rounded" />
                  <Skeleton className="mt-2 h-4 w-1/3 rounded" />
                </div>
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center shadow-card">
              <p className="font-display text-2xl text-ink-800 mb-2">No products match.</p>
              <p className="text-sm text-ink-500 mb-5">Try adjusting your filters or browse the full pantry.</p>
              <Link to="/shop" className="btn-primary inline-flex">View all</Link>
            </div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {data.pages > 1 && !loading && (
            <Pagination page={data.page} pages={data.pages} onChange={(p) => setQ({ page: p })} />
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} side="left" title="Filters">
        {filters}
      </Drawer>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  const list = [];
  for (let i = 1; i <= pages; i++) list.push(i);
  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-600 hover:border-gold hover:text-gold disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
      >‹ Prev</button>
      {list.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cx(
            'h-9 w-9 rounded-md border text-sm transition',
            n === page ? 'border-gold bg-gold text-white' : 'border-ink-200 text-ink-600 hover:border-gold hover:text-gold'
          )}
        >{n}</button>
      ))}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="rounded-md border border-ink-200 px-3 py-2 text-sm text-ink-600 hover:border-gold hover:text-gold disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-600"
      >Next ›</button>
    </div>
  );
}

function FilterPanel({ categories, brands, query, setQ, onClose }) {
  const [minP, setMinP] = useState(query.minPrice || '');
  const [maxP, setMaxP] = useState(query.maxPrice || '');

  useEffect(() => { setMinP(query.minPrice || ''); setMaxP(query.maxPrice || ''); }, [query.minPrice, query.maxPrice]);

  const selectedBrands = (query.brand || '').split(',').filter(Boolean);
  const toggleBrand = (b) => {
    const has = selectedBrands.includes(b);
    const next = has ? selectedBrands.filter((x) => x !== b) : [...selectedBrands, b];
    setQ({ brand: next.join(',') });
  };

  return (
    <div className="space-y-7">
      <Section title="Category">
        <ul className="space-y-2 text-sm">
          <li>
            <label className="flex cursor-pointer items-center gap-2 text-ink-600 hover:text-gold">
              <input type="checkbox" checked={!query.category} onChange={() => { setQ({ category: '' }); onClose?.(); }} className="check" />
              All
            </label>
          </li>
          {categories.map((c) => (
            <li key={c._id || c.slug}>
              <label className="flex cursor-pointer items-center gap-2 text-ink-600 hover:text-gold">
                <input
                  type="checkbox"
                  checked={query.category === c.slug}
                  onChange={() => { setQ({ category: query.category === c.slug ? '' : c.slug }); onClose?.(); }}
                  className="check"
                />
                {c.name}
              </label>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Price">
        <div className="flex items-center gap-2">
          <input value={minP} onChange={(e) => setMinP(e.target.value)} type="number" min="0" placeholder="Min" className="input h-9 text-sm" />
          <span className="text-ink-400">—</span>
          <input value={maxP} onChange={(e) => setMaxP(e.target.value)} type="number" min="0" placeholder="Max" className="input h-9 text-sm" />
        </div>
        <button onClick={() => setQ({ minPrice: minP || '', maxPrice: maxP || '' })} className="mt-3 text-xs font-medium text-gold hover:underline">
          Apply price
        </button>
      </Section>

      <Section title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-600 hover:text-gold">
          <input type="checkbox" checked={query.inStock === '1'} onChange={(e) => setQ({ inStock: e.target.checked ? '1' : '' })} className="check" />
          In stock only
        </label>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">{title}</p>
      {children}
    </div>
  );
}
