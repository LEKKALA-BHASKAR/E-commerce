import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Edit3, Trash2, Eye, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatNumber, cx } from '../../lib/formatters.js';
import { useDebounce } from '../../lib/useDebounce.js';

export default function AdminProducts() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('new');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const debQ = useDebounce(q, 300);

  useEffect(() => {
    adminApi.listCategories().then((r) => setCats(r.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi.listProducts({ q: debQ, category: cat, sort, page, limit: 12 })
      .then((r) => setData({ items: r.items, total: r.total, pages: r.pages }))
      .catch((e) => toast.error(e?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [debQ, cat, sort, page]);

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteProduct(p._id);
      toast.success('Product deleted');
      setData((d) => ({ ...d, items: d.items.filter((x) => x._id !== p._id), total: d.total - 1 }));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const toggleActive = async (p) => {
    try {
      const r = await adminApi.updateProduct(p._id, { isActive: !p.isActive });
      setData((d) => ({ ...d, items: d.items.map((x) => x._id === p._id ? { ...x, isActive: r.product.isActive } : x) }));
      toast.success(r.product.isActive ? 'Listed' : 'Unlisted');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-display text-3xl mt-1">Products</h1>
          <p className="mt-1 text-sm text-ink-400">{formatNumber(data.total)} total · page {page} of {data.pages}</p>
        </div>
        <Link to="/admin/products/new"><Button><Plus size={14} /> New product</Button></Link>
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="input pl-9 py-2.5" placeholder="Search by name, slug, or brand…" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-ink-400" />
            <select value={cat} onChange={(e) => { setCat(e.target.value); setPage(1); }} className="input py-2.5 w-44">
              <option value="all">All categories</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input py-2.5 w-44">
              <option value="new">Sort: Newest</option>
              <option value="name">Sort: Name</option>
              <option value="price">Sort: Price</option>
              <option value="stock">Sort: Stock</option>
              <option value="sold">Sort: Best-selling</option>
            </select>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream-100/60 text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Sold</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="inline animate-spin text-gold" size={18} /></td></tr>
              )}
              {!loading && data.items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-400">No products match.</td></tr>
              )}
              {!loading && data.items.map((p) => (
                <tr key={p._id} className="hover:bg-cream-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-cream-200" />}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-ink-400 font-mono truncate">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right">{formatPrice(p.price)}</td>
                  <td className={cx('px-4 py-3 text-right', p.stock < 10 && 'text-amber-600 font-medium')}>{p.stock}</td>
                  <td className="px-4 py-3 text-right">{p.soldCount || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className={cx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', p.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200')}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 text-ink-500">
                      <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800"><Eye size={14} /></a>
                      <Link to={`/admin/products/${p._id}`} className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800"><Edit3 size={14} /></Link>
                      <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-ink-100 text-sm">
            <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="text-ink-400">Page {page} of {data.pages}</span>
            <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
