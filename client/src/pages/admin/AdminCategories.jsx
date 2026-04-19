import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, Eye, GripVertical, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { adminApi } from '../../lib/api/admin.js';

const EMPTY = { name: '', slug: '', description: '', image: '', parent: null, order: 0, isActive: true };

export default function AdminCategories() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.listCategories().then((r) => setList(r.items || [])).catch((e) => toast.error(e?.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const open = (cat) => setEditing(cat ? { ...cat } : { ...EMPTY, _new: true });

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editing.name?.trim(),
        slug: editing.slug?.trim().toLowerCase(),
        description: editing.description || '',
        image: editing.image || '',
        parent: editing.parent || null,
        order: Number(editing.order) || 0,
        isActive: editing.isActive !== false,
      };
      if (editing._new) {
        await adminApi.createCategory(payload);
        toast.success('Category created');
      } else {
        await adminApi.updateCategory(editing._id, payload);
        toast.success('Category updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteCategory(c._id);
      toast.success('Category removed');
      setList((l) => l.filter((x) => x._id !== c._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="font-display text-3xl mt-1">Categories</h1>
          <p className="mt-1 text-sm text-ink-400">{list.length} pantry sections</p>
        </div>
        <Button onClick={() => open(null)}><Plus size={14} /> New category</Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>
      ) : list.length === 0 ? (
        <GlassCard className="text-center py-16">
          <p className="text-sm text-ink-400">No categories yet.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <GlassCard key={c._id} className="!p-0 overflow-hidden group">
              <div className="aspect-[16/9] bg-cream-200 overflow-hidden">
                {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-cover transition group-hover:scale-105" /> : null}
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-display text-lg">{c.name}</p>
                  <p className="text-xs text-ink-400">/{c.slug} · {c.productCount} products</p>
                  {!c.isActive && <span className="mt-1 inline-block text-[10px] uppercase tracking-wider rounded bg-ink-100 text-ink-500 px-1.5 py-0.5">Hidden</span>}
                </div>
                <div className="flex items-center gap-1 text-ink-500">
                  <a href={`/shop?category=${c.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800" title="View"><Eye size={14} /></a>
                  <button onClick={() => open(c)} className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800" title="Edit"><Edit3 size={14} /></button>
                  <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {!loading && list.length > 0 && (
        <GlassCard>
          <h2 className="font-display text-xl mb-4">Sort order</h2>
          <ul className="divide-y divide-ink-100">
            {list.map((c, i) => (
              <li key={c._id} className="flex items-center gap-3 py-2.5">
                <GripVertical size={14} className="text-ink-300" />
                <span className="text-xs text-ink-400 w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 text-sm">{c.name}</span>
                <span className="text-xs text-ink-400">/{c.slug}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-800/40 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="glass-strong w-full max-w-lg p-6 sm:p-8">
            <h2 className="font-display text-2xl mb-1">{editing._new ? 'New category' : 'Edit category'}</h2>
            <p className="text-xs text-ink-400 mb-5">Storefront pantry section.</p>
            <div className="space-y-4">
              <Input label="Name" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Input label="Slug" value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase() })} placeholder="rice" />
              <Input label="Cover image URL" value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
              <Input label="Sort order" type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: e.target.value })} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="check" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                Active (visible on storefront)
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">{editing._new ? 'Create' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
