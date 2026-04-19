import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { catalogApi } from '../../lib/api/catalog.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useDebounce } from '../../lib/useDebounce.js';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const dq = useDebounce(q, 300);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!dq) { setItems([]); setTotal(0); return; }
    setLoading(true);
    setParams({ q: dq }, { replace: true });
    catalogApi.listProducts({ q: dq, limit: 36 })
      .then((d) => { setItems(d.items); setTotal(d.total); })
      .finally(() => setLoading(false));
  }, [dq, setParams]);

  return (
    <div className="container-luxe py-12">
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the maison…"
            className="input pl-12 h-14 text-lg"
          />
        </div>
        {dq && !loading && (
          <p className="mt-3 text-sm text-ink-300 text-center">{total} {total === 1 ? 'result' : 'results'} for “{dq}”</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-4 w-2/3 mt-3 rounded" />
            </div>
          ))}
        </div>
      ) : !dq ? (
        <p className="text-center text-ink-300 py-20">Start typing to find pieces, brands, or categories.</p>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl mb-2">No matches.</p>
          <p className="text-sm text-ink-300 mb-5">Try a different word, or <Link to="/shop" className="text-gold hover:underline">browse the full edit</Link>.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
