import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Star, CheckCircle2, EyeOff, Trash2, Loader2, Search } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatDateTime, formatNumber, cx } from '../../lib/formatters.js';
import { useDebounce } from '../../lib/useDebounce.js';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
];

export default function AdminReviews() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const debQ = useDebounce(q, 300);

  const load = () => {
    setLoading(true);
    adminApi.listReviews({ q: debQ, status, page, limit: 12 })
      .then((r) => setData({ items: r.items, total: r.total, pages: r.pages }))
      .catch((e) => toast.error(e?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [debQ, status, page]);

  const toggle = async (rev) => {
    try {
      await adminApi.updateReview(rev._id, { isApproved: !rev.isApproved });
      toast.success(rev.isApproved ? 'Hidden' : 'Approved');
      setData((d) => ({ ...d, items: d.items.map((r) => r._id === rev._id ? { ...r, isApproved: !rev.isApproved } : r) }));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (rev) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    try {
      await adminApi.deleteReview(rev._id);
      toast.success('Review deleted');
      setData((d) => ({ ...d, items: d.items.filter((r) => r._id !== rev._id), total: d.total - 1 }));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Community</p>
          <h1 className="font-display text-3xl mt-1">Reviews</h1>
          <p className="mt-1 text-sm text-ink-400">{formatNumber(data.total)} total · page {page} of {data.pages}</p>
        </div>
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="input pl-9 py-2.5" placeholder="Search by title, body, or author…" />
          </div>
          <div className="flex items-center gap-2">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => { setStatus(t.key); setPage(1); }} className={cx(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition',
                status === t.key ? 'bg-gold text-white border-gold' : 'border-ink-200 text-ink-500 hover:border-gold hover:text-gold'
              )}>{t.label}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>
      ) : data.items.length === 0 ? (
        <GlassCard className="text-center py-16"><p className="text-sm text-ink-400">No reviews match.</p></GlassCard>
      ) : (
        <ul className="space-y-3">
          {data.items.map((r) => (
            <GlassCard key={r._id} className="!p-5">
              <li className="flex flex-col gap-3 sm:flex-row sm:items-start">
                {r.product?.images?.[0] ? <img src={r.product.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0" /> : <div className="h-16 w-16 rounded-lg bg-cream-200 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium">{r.product?.name || 'Product'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'fill-gold text-gold' : 'text-ink-300'} />
                          ))}
                        </div>
                        <span className="text-xs text-ink-400">by {r.authorName || r.user?.name || 'Anonymous'} · {formatDateTime(r.createdAt)}</span>
                      </div>
                    </div>
                    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', r.isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                      {r.isApproved ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-medium text-ink-800">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-ink-600 whitespace-pre-line">{r.body}</p>}
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggle(r)}>
                      {r.isApproved ? <><EyeOff size={13} /> Hide</> : <><CheckCircle2 size={13} /> Approve</>}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(r)}><Trash2 size={13} /> Delete</Button>
                  </div>
                </div>
              </li>
            </GlassCard>
          ))}
        </ul>
      )}

      {data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-ink-400">Page {page} of {data.pages}</span>
          <Button size="sm" variant="ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
