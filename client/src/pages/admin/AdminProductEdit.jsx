import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Trash2, Plus, X, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { adminApi } from '../../lib/api/admin.js';

const EMPTY = {
  name: '', slug: '', brand: '', categoryId: '', description: '',
  price: 0, compareAt: null, stock: 0,
  images: [], variants: [], tags: '', badges: '',
  isActive: true, isFeatured: false, isBestSeller: false,
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi.listCategories().then((r) => {
      setCats(r.items || []);
      if (isNew) setForm((f) => ({ ...f, categoryId: r.items?.[0]?._id || '' }));
    });
  }, [isNew]);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    adminApi.getProduct(id).then(({ product: p }) => {
      setForm({
        ...p,
        categoryId: typeof p.category === 'object' ? p.category._id : p.category,
        tags: (p.tags || []).join(', '),
        badges: (p.badges || []).join(', '),
        compareAt: p.compareAt ?? null,
      });
    }).catch((e) => {
      toast.error(e?.response?.data?.message || 'Failed to load');
      navigate('/admin/products');
    }).finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const addImage = () => {
    const url = prompt('Image URL');
    if (url) setForm((f) => ({ ...f, images: [...(f.images || []), url] }));
  };
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const addVariant = () => setForm((f) => ({ ...f, variants: [...(f.variants || []), { sku: '', label: '', stock: 0, priceDelta: 0 }] }));
  const updateVariant = (i, k, v) => setForm((f) => ({
    ...f, variants: f.variants.map((vr, idx) => idx === i ? { ...vr, [k]: k === 'stock' || k === 'priceDelta' ? Number(v) : v } : vr),
  }));
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const buildPayload = () => ({
    name: form.name?.trim(),
    slug: form.slug?.trim().toLowerCase(),
    brand: form.brand || '',
    description: form.description || '',
    category: form.categoryId,
    price: Number(form.price) || 0,
    compareAt: form.compareAt ? Number(form.compareAt) : null,
    images: form.images || [],
    variants: (form.variants || []).map((v) => ({
      sku: v.sku, label: v.label, color: v.color || '',
      qty: v.qty === '' || v.qty == null ? null : Number(v.qty),
      unit: v.unit || '',
      stock: Number(v.stock) || 0, priceDelta: Number(v.priceDelta) || 0,
    })),
    stock: Number(form.stock) || 0,
    tags: typeof form.tags === 'string' ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : (form.tags || []),
    badges: typeof form.badges === 'string' ? form.badges.split(',').map((s) => s.trim()).filter(Boolean) : (form.badges || []),
    isActive: !!form.isActive,
    isFeatured: !!form.isFeatured,
    isBestSeller: !!form.isBestSeller,
  });

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.categoryId) {
      toast.error('Name, slug and category are required');
      return;
    }
    setBusy(true);
    try {
      if (isNew) {
        const r = await adminApi.createProduct(buildPayload());
        toast.success('Product created');
        navigate(`/admin/products/${r.product._id}`);
      } else {
        await adminApi.updateProduct(id, buildPayload());
        toast.success('Product updated');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-gold">
            <ArrowLeft size={12} /> Back to products
          </Link>
          <h1 className="font-display text-3xl mt-2">{isNew ? 'New product' : form.name}</h1>
          <p className="mt-1 text-sm text-ink-400">{isNew ? 'Create a new pantry listing.' : `Editing ${form.slug}`}</p>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <Button type="button" variant="danger" onClick={onDelete}><Trash2 size={14} /> Delete</Button>}
          <Button type="submit" disabled={busy}><Save size={14} /> {isNew ? 'Create product' : 'Save changes'}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="font-display text-xl mb-4">Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={set('name')} placeholder="Royal Basmati" />
              <Input label="Slug" value={form.slug} onChange={set('slug')} placeholder="royal-basmati-rice" />
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Category</span>
                <select className="input" value={form.categoryId || ''} onChange={set('categoryId')}>
                  <option value="">Select…</option>
                  {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Brand" value={form.brand} onChange={set('brand')} placeholder="House label" />
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Description</span>
                <textarea rows={5} value={form.description} onChange={set('description')} className="input" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">Images</h2>
              <Button type="button" variant="ghost" size="sm" onClick={addImage}><Plus size={14} /> Add image</Button>
            </div>
            {form.images?.length ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.images.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-ink-100">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 rounded-full bg-white/90 p-1 text-ink-700 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-ink-400">No images yet.</p>}
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-xl">Pack sizes / variants</h2>
              <Button type="button" variant="ghost" size="sm" onClick={addVariant}><Plus size={14} /> Add pack</Button>
            </div>
            <p className="text-xs text-ink-400 mb-4">Indian shoppers expect to pick a pack size — kg for rice & atta, litres for oils, grams for spices, pieces for soap & snacks.</p>

            <VariantPresets onPick={(presets) => setForm((f) => ({ ...f, variants: [...(f.variants || []), ...presets] }))} />

            {form.variants?.length ? (
              <div className="mt-4 space-y-2">
                {form.variants.map((v, i) => (
                  <VariantRow
                    key={i}
                    v={v}
                    basePrice={Number(form.price) || 0}
                    onChange={(patch) => Object.entries(patch).forEach(([k, val]) => updateVariant(i, k, val))}
                    onRemove={() => removeVariant(i)}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-400">No pack sizes yet — leave empty to sell as a single SKU at the base price.</p>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="font-display text-xl mb-4">Pricing</h2>
            <div className="space-y-4">
              <Input label="Price (₹)" type="number" value={form.price} onChange={set('price')} />
              <Input label="Compare-at (₹)" type="number" value={form.compareAt ?? ''} onChange={set('compareAt')} hint="Optional. Shown as strike-through." />
              <Input label="Stock" type="number" value={form.stock} onChange={set('stock')} hint={form.variants?.length ? 'Auto-summed from variants.' : ''} />
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4">Visibility</h2>
            <div className="space-y-3 text-sm">
              <Toggle label="Active (listed)" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
              <Toggle label="Featured on home" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
              <Toggle label="Best seller" checked={form.isBestSeller} onChange={(v) => setForm({ ...form, isBestSeller: v })} />
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-xl mb-4">Discoverability</h2>
            <div className="space-y-4">
              <Input label="Tags (comma-separated)" value={form.tags} onChange={set('tags')} placeholder="organic, gluten-free" />
              <Input label="Badges" value={form.badges} onChange={set('badges')} placeholder="New, Bestseller" />
            </div>
          </GlassCard>
        </div>
      </div>
    </form>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-ink-100 bg-cream-50/60 px-3 py-2.5">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-gold' : 'bg-ink-200'}`}>
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'L', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pieces' },
  { value: 'pack', label: 'pack' },
  { value: '', label: 'no unit' },
];

const PRESET_BUNDLES = [
  { id: 'rice', label: 'Rice / Atta', sizes: [{ qty: 1, unit: 'kg' }, { qty: 5, unit: 'kg' }, { qty: 10, unit: 'kg' }] },
  { id: 'oil', label: 'Oil / Ghee', sizes: [{ qty: 500, unit: 'ml' }, { qty: 1, unit: 'L' }, { qty: 5, unit: 'L' }] },
  { id: 'spices', label: 'Spices', sizes: [{ qty: 50, unit: 'g' }, { qty: 100, unit: 'g' }, { qty: 250, unit: 'g' }] },
  { id: 'pulses', label: 'Pulses / Dal', sizes: [{ qty: 500, unit: 'g' }, { qty: 1, unit: 'kg' }, { qty: 5, unit: 'kg' }] },
  { id: 'snacks', label: 'Snacks / Pieces', sizes: [{ qty: 1, unit: 'pcs' }, { qty: 6, unit: 'pcs' }, { qty: 12, unit: 'pcs' }] },
];

function makeLabel(qty, unit) {
  if (!qty) return unit || '';
  if (!unit) return String(qty);
  return `${qty} ${unit}`;
}
function makeSku(qty, unit) {
  return `${qty}${(unit || 'X').toUpperCase()}`;
}

function VariantPresets({ onPick }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-cream-50/40 p-3">
      <p className="text-[11px] uppercase tracking-wider text-ink-400 mb-2">Quick presets</p>
      <div className="flex flex-wrap gap-2">
        {PRESET_BUNDLES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.sizes.map((s) => ({
              sku: makeSku(s.qty, s.unit),
              label: makeLabel(s.qty, s.unit),
              qty: s.qty,
              unit: s.unit,
              stock: 0,
              priceDelta: 0,
            })))}
            className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs text-ink-600 hover:border-gold hover:text-gold transition"
          >
            + {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function VariantRow({ v, basePrice, onChange, onRemove }) {
  const qty = v.qty ?? '';
  const unit = v.unit ?? '';
  const setUnit = (next) => {
    const label = v._customLabel ? v.label : makeLabel(qty || v.label?.split(' ')[0] || '', next);
    onChange({ unit: next, label, sku: v.sku || makeSku(qty || 'X', next) });
  };
  const setQty = (next) => {
    const n = next === '' ? '' : Number(next);
    const label = v._customLabel ? v.label : makeLabel(n, unit);
    onChange({ qty: n, label, sku: v.sku || makeSku(n || 'X', unit) });
  };
  const setLabel = (next) => onChange({ label: next, _customLabel: true });

  const finalPrice = basePrice + (Number(v.priceDelta) || 0);

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-12 sm:col-span-2">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">Qty</span>
          <input className="input" type="number" min="0" placeholder="1" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-2">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">Unit</span>
          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div className="col-span-12 sm:col-span-3">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">Label</span>
          <input className="input" placeholder="e.g. 5 kg bag" value={v.label || ''} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-2">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">SKU</span>
          <input className="input" placeholder="RB-5KG" value={v.sku || ''} onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })} />
        </div>
        <div className="col-span-3 sm:col-span-1">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">Stock</span>
          <input className="input" type="number" min="0" value={v.stock ?? 0} onChange={(e) => onChange({ stock: Number(e.target.value) })} />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="mb-1 block text-[10px] uppercase tracking-wider text-ink-400">±₹</span>
          <input className="input" type="number" value={v.priceDelta ?? 0} onChange={(e) => onChange({ priceDelta: Number(e.target.value) })} />
        </div>
        <div className="col-span-1 flex justify-end">
          <button type="button" onClick={onRemove} className="p-2 rounded text-ink-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
        <span>Final price for this pack: <span className="font-medium text-ink-800">₹{finalPrice.toLocaleString('en-IN')}</span></span>
        <span className={v.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>{v.stock > 0 ? 'In stock' : 'Out of stock'}</span>
      </div>
    </div>
  );
}
