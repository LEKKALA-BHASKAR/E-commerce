import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { closeSearch } from '../../store/slices/uiSlice.js';
import { catalogApi } from '../../lib/api/catalog.js';
import { useDebounce } from '../../lib/useDebounce.js';
import { formatPrice } from '../../lib/formatters.js';

const trending = ['Monaco Automatic', 'Oud Impérial', 'Aria Pendant', 'Noir Weekender'];

export default function SearchOverlay() {
  const open = useSelector((s) => s.ui.searchOpen);
  const dispatch = useDispatch();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const dq = useDebounce(q, 200);

  useEffect(() => { if (!open) { setQ(''); setResults([]); } }, [open]);

  useEffect(() => {
    if (!dq) { setResults([]); return; }
    setLoading(true);
    catalogApi.suggest(dq)
      .then((d) => setResults(d.items || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [dq]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink-900/80 backdrop-blur-md" onClick={() => dispatch(closeSearch())} />
          <motion.div
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            className="relative mx-auto mt-20 max-w-2xl px-4"
          >
            <div className="glass-strong rounded-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <Search size={18} className="text-gold" />
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search the maison…"
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-300"
                />
                <button onClick={() => dispatch(closeSearch())} className="rounded-full p-1 hover:bg-white/10"><X size={16} /></button>
              </div>
              <div className="p-4">
                {!dq && (
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.25em] text-ink-300">Trending</p>
                    <div className="flex flex-wrap gap-2">
                      {trending.map((t) => (
                        <button key={t} onClick={() => setQ(t)} className="chip hover:border-gold hover:text-gold">{t}</button>
                      ))}
                    </div>
                  </div>
                )}
                {dq && !loading && results.length === 0 && (
                  <p className="py-6 text-center text-sm text-ink-300">No matches for “{dq}”.</p>
                )}
                {results.length > 0 && (
                  <ul className="divide-y divide-white/5">
                    {results.map((p) => (
                      <li key={p._id || p.id}>
                        <Link to={`/product/${p.slug}`} onClick={() => dispatch(closeSearch())} className="flex items-center gap-4 py-3 group">
                          <img src={p.images?.[0]} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="font-display text-sm group-hover:text-gold transition-colors">{p.name}</p>
                            <p className="text-xs text-ink-300">{p.brand}</p>
                          </div>
                          <span className="text-sm">{formatPrice(p.price)}</span>
                          <ArrowUpRight size={14} className="text-ink-300 group-hover:text-gold transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {dq && (
                  <Link to={`/search?q=${encodeURIComponent(dq)}`} onClick={() => dispatch(closeSearch())} className="mt-4 block text-center text-xs text-gold hover:underline">
                    View all results →
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
