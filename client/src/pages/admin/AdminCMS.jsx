import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, Save, Loader2, Globe } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatDate, cx } from '../../lib/formatters.js';

const STATUS_CLS = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
};

export default function AdminCMS() {
  const [pages, setPages] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () =>
    adminApi.listPages().then((r) => {
      setPages(r.items || []);
      if (!activeId && r.items?.[0]) {
        setActiveId(r.items[0]._id);
        setDraft(r.items[0]);
      }
    }).catch((e) => toast.error(e?.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (!activeId) { setDraft(null); return; }
    const p = pages.find((x) => x._id === activeId);
    setDraft(p ? { ...p } : null);
  }, [activeId, pages]);

  const dirty = useMemo(() => {
    if (!draft) return false;
    const original = pages.find((p) => p._id === draft._id);
    if (!original) return true;
    return ['title', 'slug', 'status', 'excerpt', 'body', 'seoTitle', 'seoDescription'].some((k) => (draft[k] || '') !== (original[k] || ''));
  }, [draft, pages]);

  const create = async () => {
    const slug = `new-page-${Date.now().toString(36)}`;
    try {
      const r = await adminApi.createPage({ slug, title: 'Untitled page', status: 'draft' });
      toast.success('Draft created');
      const fresh = await adminApi.listPages();
      setPages(fresh.items || []);
      setActiveId(r.page._id);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed');
    }
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const r = await adminApi.updatePage(draft._id, {
        title: draft.title, slug: draft.slug, status: draft.status,
        excerpt: draft.excerpt || '', body: draft.body || '',
        seoTitle: draft.seoTitle || '', seoDescription: draft.seoDescription || '',
      });
      toast.success('Page saved');
      setPages((rows) => rows.map((p) => p._id === draft._id ? r.page : p));
      setDraft(r.page);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await adminApi.deletePage(p._id);
      toast.success('Page deleted');
      const rest = pages.filter((x) => x._id !== p._id);
      setPages(rest);
      if (activeId === p._id) setActiveId(rest[0]?._id || null);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Content</p>
          <h1 className="font-display text-3xl mt-1">Pages & CMS</h1>
          <p className="mt-1 text-sm text-ink-400">Storefront landing copy, policies, and editorial.</p>
        </div>
        <Button onClick={create}><Plus size={14} /> New page</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4 !p-0 overflow-hidden">
          <div className="border-b border-ink-100 px-4 py-3 flex items-center gap-2 text-xs uppercase tracking-wider text-ink-400">
            <FileText size={12} /> All pages · {pages.length}
          </div>
          {loading ? (
            <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-gold" /></div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm text-ink-400">No pages yet. Create your first one.</p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100 max-h-[60vh] overflow-y-auto">
              {pages.map((p) => (
                <li key={p._id}>
                  <button
                    onClick={() => setActiveId(p._id)}
                    className={cx(
                      'w-full text-left px-4 py-3 transition',
                      activeId === p._id ? 'bg-gold/5' : 'hover:bg-cream-50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-[11px] text-ink-400 font-mono">/{p.slug}</p>
                      </div>
                      <span className={cx('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize shrink-0', STATUS_CLS[p.status])}>{p.status}</span>
                    </div>
                    <p className="text-[11px] text-ink-400 mt-1">Updated {formatDate(p.updatedAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-8">
          {!draft ? (
            <div className="text-center py-12">
              <FileText size={36} className="mx-auto text-ink-300" />
              <p className="mt-3 text-sm text-ink-500">Select or create a page to start editing.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Title</span>
                  <input className="input text-lg font-display" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => remove(draft)}><Trash2 size={13} /> Delete</Button>
                  <Button size="sm" disabled={!dirty || busy} onClick={save}><Save size={13} /> Save</Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase() })} />
                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Status</span>
                  <select className="input" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Excerpt</span>
                <textarea rows={2} className="input" value={draft.excerpt || ''} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} placeholder="One-line summary used in cards & search results." />
              </div>

              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Body (Markdown)</span>
                <textarea rows={14} className="input font-mono text-sm" value={draft.body || ''} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="# Page heading\n\nWrite your content here…" />
              </div>

              <div className="border-t border-ink-100 pt-5">
                <h3 className="font-display text-lg mb-3 flex items-center gap-2"><Globe size={14} /> SEO</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="SEO title" value={draft.seoTitle || ''} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} />
                  <div>
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Meta description</span>
                    <textarea rows={2} className="input" value={draft.seoDescription || ''} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
