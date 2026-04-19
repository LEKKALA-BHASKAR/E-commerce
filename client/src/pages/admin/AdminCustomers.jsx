import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Crown, Sparkles, Users, IndianRupee, ShieldOff, ShieldCheck, Loader2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { formatPrice, formatNumber, formatDate, cx } from '../../lib/formatters.js';
import { useDebounce } from '../../lib/useDebounce.js';

const ROLE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customers' },
  { key: 'editor', label: 'Editors' },
  { key: 'manager', label: 'Managers' },
  { key: 'superadmin', label: 'Superadmins' },
];

const ROLE_TONE = {
  customer: 'bg-cream-100 text-ink-600 border-ink-200',
  editor: 'bg-sky-50 text-sky-700 border-sky-200',
  manager: 'bg-purple-50 text-purple-700 border-purple-200',
  superadmin: 'bg-gold/10 text-gold-600 border-gold/30',
};

export default function AdminCustomers() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const debQ = useDebounce(q, 300);

  const load = () => {
    setLoading(true);
    adminApi.listCustomers({ q: debQ, role, page, limit: 15 })
      .then((r) => setData({ items: r.items, total: r.total, pages: r.pages }))
      .catch((e) => toast.error(e?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [debQ, role, page]);

  const updateRole = async (c, newRole) => {
    if (!confirm(`Change ${c.name}'s role to ${newRole}?`)) return;
    try {
      await adminApi.updateCustomer(c.id, { role: newRole });
      toast.success('Role updated');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const toggleBlock = async (c) => {
    if (!confirm(`${c.blocked ? 'Unblock' : 'Block'} ${c.name}?`)) return;
    try {
      await adminApi.updateCustomer(c.id, { blocked: !c.blocked });
      toast.success(c.blocked ? 'Unblocked' : 'Blocked');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed');
    }
  };

  const totalSpend = data.items.reduce((s, c) => s + (c.spend || 0), 0);
  const vip = data.items.filter((c) => c.spend > 10000).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">People</p>
          <h1 className="font-display text-3xl mt-1">Customers</h1>
          <p className="mt-1 text-sm text-ink-400">{formatNumber(data.total)} total · page {page} of {data.pages}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} label="Customers" value={formatNumber(data.total)} />
        <Stat icon={Crown} label="VIPs (page)" value={formatNumber(vip)} accent="gold" />
        <Stat icon={IndianRupee} label="Spend (page)" value={formatPrice(totalSpend)} />
        <Stat icon={Sparkles} label="Avg LTV (page)" value={formatPrice(data.items.length ? Math.round(totalSpend / data.items.length) : 0)} />
      </div>

      <GlassCard className="!p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="input pl-9 py-2.5" placeholder="Search by name, email, or phone…" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {ROLE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setRole(t.key); setPage(1); }}
                className={cx(
                  'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition',
                  role === t.key ? 'bg-gold text-white border-gold' : 'border-ink-200 text-ink-500 hover:border-gold hover:text-gold'
                )}
              >{t.label}</button>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream-100/60 text-[11px] uppercase tracking-wider text-ink-400">
              <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Spend</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><Loader2 className="inline animate-spin text-gold" size={18} /></td></tr>
              )}
              {!loading && data.items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-400">No customers match.</td></tr>
              )}
              {!loading && data.items.map((c) => (
                <tr key={c.id} className="hover:bg-cream-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold font-medium">
                        {(c.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-ink-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{c.orders}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(c.spend)}</td>
                  <td className="px-4 py-3">
                    <select value={c.role} onChange={(e) => updateRole(c, e.target.value)} className={cx('input !py-1 !text-xs capitalize border', ROLE_TONE[c.role])}>
                      <option value="customer">customer</option>
                      <option value="editor">editor</option>
                      <option value="manager">manager</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {c.blocked ? <span className="inline-flex rounded-full border border-red-200 bg-red-50 text-red-700 px-2.5 py-0.5 text-[11px] font-medium">Blocked</span>
                      : <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[11px] font-medium">Active</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleBlock(c)} className={cx('inline-flex items-center gap-1 text-xs hover:underline', c.blocked ? 'text-emerald-700' : 'text-red-700')}>
                      {c.blocked ? <><ShieldCheck size={12} /> Unblock</> : <><ShieldOff size={12} /> Block</>}
                    </button>
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

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <GlassCard>
      <div className={cx('grid h-10 w-10 place-items-center rounded-xl', accent === 'gold' ? 'bg-gold/15 text-gold' : 'bg-gold/10 text-gold')}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </GlassCard>
  );
}
