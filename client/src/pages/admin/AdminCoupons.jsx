import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, Copy, Ticket, TrendingUp, CheckCircle2, Calendar, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatDate, formatNumber, cx } from '../../lib/formatters.js';

const EMPTY = {
  code: '', description: '', type: 'percent', value: 10,
  minSubtotal: 0, maxDiscount: null, expiresAt: '', startsAt: '',
  usageLimit: null, perUserLimit: null, isActive: true,
};

const computeStatus = (c) => {
  if (!c.isActive) return 'Disabled';
  const now = Date.now();
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return 'Scheduled';
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return 'Expired';
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return 'Expired';
  return 'Active';
};
const STATUS_CLS = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Scheduled: 'bg-sky-50 text-sky-700 border-sky-200',
  Expired: 'bg-ink-100 text-ink-500 border-ink-200',
  Disabled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminCoupons() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.listCoupons().then((r) => setList(r.items || [])).catch((e) => toast.error(e?.response?.data?.message || 'Failed to load')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const totals = useMemo(() => ({
    active: list.filter((c) => computeStatus(c) === 'Active').length,
    redemptions: list.reduce((s, c) => s + (c.usedCount || 0), 0),
  }), [list]);

  const open = (c) => setEditing(c ? {
    ...c,
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : '',
    startsAt: c.startsAt ? new Date(c.startsAt).toISOString().slice(0, 10) : '',
  } : { ...EMPTY, _new: true });

  const save = async (e) => {
    e.preventDefault();
    if (!editing.code) return toast.error('Code required');
    setBusy(true);
    try {
      const payload = {
        code: editing.code.toUpperCase(),
        description: editing.description || '',
        type: editing.type,
        value: Number(editing.value) || 0,
        minSubtotal: Number(editing.minSubtotal) || 0,
        maxDiscount: editing.maxDiscount ? Number(editing.maxDiscount) : null,
        startsAt: editing.startsAt || null,
        expiresAt: editing.expiresAt || null,
        usageLimit: editing.usageLimit ? Number(editing.usageLimit) : null,
        perUserLimit: editing.perUserLimit ? Number(editing.perUserLimit) : null,
        isActive: editing.isActive !== false,
      };
      if (editing._new) {
        await adminApi.createCoupon(payload);
        toast.success('Coupon created');
      } else {
        await adminApi.updateCoupon(editing._id, payload);
        toast.success('Coupon updated');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await adminApi.deleteCoupon(c._id);
      toast.success('Coupon removed');
      setList((l) => l.filter((x) => x._id !== c._id));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed');
    }
  };

  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success(`Copied ${code}`); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Promotions</p>
          <h1 className="font-display text-3xl mt-1">Coupons</h1>
          <p className="mt-1 text-sm text-ink-400">{list.length} codes · {formatNumber(totals.redemptions)} redemptions</p>
        </div>
        <Button onClick={() => open(null)}><Plus size={14} /> New coupon</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Ticket} label="Total codes" value={list.length} />
        <Stat icon={CheckCircle2} label="Active" value={totals.active} accent="emerald" />
        <Stat icon={TrendingUp} label="Redemptions" value={formatNumber(totals.redemptions)} />
        <Stat icon={Calendar} label="Expiring 30d" value={list.filter((c) => c.expiresAt && new Date(c.expiresAt).getTime() - Date.now() < 30 * 86400000 && new Date(c.expiresAt).getTime() > Date.now()).length} accent="amber" />
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-gold" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-cream-100/60 text-[11px] uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Min subtotal</th>
                  <th className="px-4 py-3 text-right">Used / Limit</th>
                  <th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((c) => {
                  const status = computeStatus(c);
                  return (
                    <tr key={c._id} className="hover:bg-cream-50/70">
                      <td className="px-4 py-3">
                        <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded bg-cream-100 text-ink-700 hover:bg-gold/10 hover:text-gold">
                          {c.code} <Copy size={11} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink-500">{c.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{c.type === 'percent' ? `${c.value}%` : formatPrice(c.value)}</td>
                      <td className="px-4 py-3 text-right text-ink-500">{c.minSubtotal ? formatPrice(c.minSubtotal) : '—'}</td>
                      <td className="px-4 py-3 text-right text-ink-500">{c.usedCount || 0} / {c.usageLimit ?? '∞'}</td>
                      <td className="px-4 py-3 text-ink-500">{c.expiresAt ? formatDate(c.expiresAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cx('inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium', STATUS_CLS[status])}>{status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 text-ink-500">
                          <button onClick={() => open(c)} className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800"><Edit3 size={14} /></button>
                          <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-400">No coupons yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-800/40 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="glass-strong w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-1">{editing._new ? 'New coupon' : 'Edit coupon'}</h2>
            <p className="text-xs text-ink-400 mb-5">Storefront discount code.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Code" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Type</span>
                <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="percent">Percent (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>
              <Input label="Value" type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
              <Input label="Max discount cap (₹)" type="number" value={editing.maxDiscount ?? ''} onChange={(e) => setEditing({ ...editing, maxDiscount: e.target.value })} hint="Optional. For percent coupons." />
              <Input label="Min subtotal (₹)" type="number" value={editing.minSubtotal} onChange={(e) => setEditing({ ...editing, minSubtotal: e.target.value })} />
              <Input label="Usage limit" type="number" value={editing.usageLimit ?? ''} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value })} hint="Total uses. Leave blank for ∞." />
              <Input label="Per-user limit" type="number" value={editing.perUserLimit ?? ''} onChange={(e) => setEditing({ ...editing, perUserLimit: e.target.value })} />
              <Input label="Starts" type="date" value={editing.startsAt || ''} onChange={(e) => setEditing({ ...editing, startsAt: e.target.value })} />
              <Input label="Expires" type="date" value={editing.expiresAt || ''} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} />
              <div className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Description</span>
                <textarea rows={2} className="input" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Internal note shown in dashboard." />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" className="check" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                Enabled
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{editing._new ? 'Create' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  const tones = { emerald: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', default: 'bg-gold/10 text-gold' };
  return (
    <GlassCard>
      <div className={cx('grid h-10 w-10 place-items-center rounded-xl', tones[accent] || tones.default)}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </GlassCard>
  );
}
