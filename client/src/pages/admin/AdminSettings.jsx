import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Store, Truck, CreditCard, Bell, Loader2, Megaphone } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import { adminApi } from '../../lib/api/admin.js';
import { cx } from '../../lib/formatters.js';

const TABS = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const DEFAULTS = {
  general: { storeName: 'Sahara Groceries', supportEmail: 'hello@sahara.in', supportPhone: '+91 80 4000 1234', currency: 'INR', addressLine1: '', city: '', country: 'India' },
  announcement: { enabled: true, message: 'Free shipping on orders over ₹999 — flat 5% off with code SAHARA5', linkLabel: 'Shop now', linkHref: '/shop' },
  shipping: { freeAbove: 999, flatRate: 99, codAvailable: true, intlEnabled: false, processingDays: 1 },
  payments: { razorpayEnabled: true, codEnabled: true, taxRate: 5, taxInclusive: false },
  notifications: { orderConfirmation: true, shippingUpdates: true, marketingEmails: false, lowStockAlerts: true },
};

export default function AdminSettings() {
  const [tab, setTab] = useState('general');
  const [values, setValues] = useState(DEFAULTS);
  const [original, setOriginal] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((r) => {
      const merged = { ...DEFAULTS };
      Object.keys(DEFAULTS).forEach((k) => { merged[k] = { ...DEFAULTS[k], ...(r.values?.[k] || {}) }; });
      setValues(merged);
      setOriginal(merged);
    }).catch((e) => toast.error(e?.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (section, field, value) =>
    setValues((v) => ({ ...v, [section]: { ...v[section], [field]: value } }));

  const dirty = JSON.stringify(values) !== JSON.stringify(original);

  const save = async () => {
    setBusy(true);
    try {
      const r = await adminApi.updateSettings(values);
      const merged = { ...DEFAULTS };
      Object.keys(DEFAULTS).forEach((k) => { merged[k] = { ...DEFAULTS[k], ...(r.values?.[k] || {}) }; });
      setOriginal(merged);
      setValues(merged);
      toast.success('Settings saved');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1 className="font-display text-3xl mt-1">Settings</h1>
          <p className="mt-1 text-sm text-ink-400">Storefront identity, shipping, payments, and notifications.</p>
        </div>
        <Button disabled={!dirty || busy} onClick={save}><Save size={14} /> Save changes</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <GlassCard className="lg:col-span-3 !p-2">
          <nav className="space-y-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cx(
                  'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                  tab === t.id ? 'bg-gold/10 text-gold-600 font-medium' : 'text-ink-500 hover:bg-cream-100 hover:text-ink-800'
                )}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </nav>
        </GlassCard>

        <div className="lg:col-span-9 space-y-6">
          {tab === 'general' && <GeneralPanel v={values.general} set={(k, val) => setField('general', k, val)} />}
          {tab === 'announcement' && <AnnouncementPanel v={values.announcement} set={(k, val) => setField('announcement', k, val)} />}
          {tab === 'shipping' && <ShippingPanel v={values.shipping} set={(k, val) => setField('shipping', k, val)} />}
          {tab === 'payments' && <PaymentsPanel v={values.payments} set={(k, val) => setField('payments', k, val)} />}
          {tab === 'notifications' && <NotificationsPanel v={values.notifications} set={(k, val) => setField('notifications', k, val)} />}
        </div>
      </div>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <GlassCard>
      <h2 className="font-display text-xl mb-1">{title}</h2>
      {hint && <p className="text-xs text-ink-400 mb-5">{hint}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </GlassCard>
  );
}

function GeneralPanel({ v, set }) {
  return (
    <Section title="General" hint="Public-facing identity for the store.">
      <Input label="Store name" value={v.storeName} onChange={(e) => set('storeName', e.target.value)} />
      <Input label="Currency" value={v.currency} onChange={(e) => set('currency', e.target.value)} />
      <Input label="Support email" type="email" value={v.supportEmail} onChange={(e) => set('supportEmail', e.target.value)} />
      <Input label="Support phone" value={v.supportPhone} onChange={(e) => set('supportPhone', e.target.value)} />
      <div className="sm:col-span-2"><Input label="Address line 1" value={v.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} /></div>
      <Input label="City" value={v.city} onChange={(e) => set('city', e.target.value)} />
      <Input label="Country" value={v.country} onChange={(e) => set('country', e.target.value)} />
    </Section>
  );
}

function AnnouncementPanel({ v, set }) {
  return (
    <Section title="Announcement bar" hint="Top-of-storefront strip. Toggle off to hide.">
      <div className="sm:col-span-2"><Toggle label="Show announcement bar" checked={v.enabled} onChange={(c) => set('enabled', c)} /></div>
      <div className="sm:col-span-2"><Input label="Message" value={v.message} onChange={(e) => set('message', e.target.value)} /></div>
      <Input label="Link label" value={v.linkLabel} onChange={(e) => set('linkLabel', e.target.value)} />
      <Input label="Link target" value={v.linkHref} onChange={(e) => set('linkHref', e.target.value)} placeholder="/shop" />
    </Section>
  );
}

function ShippingPanel({ v, set }) {
  return (
    <Section title="Shipping" hint="Rates, free-shipping threshold, and fulfillment timing.">
      <Input label="Free shipping above (₹)" type="number" value={v.freeAbove} onChange={(e) => set('freeAbove', Number(e.target.value))} />
      <Input label="Flat rate (₹)" type="number" value={v.flatRate} onChange={(e) => set('flatRate', Number(e.target.value))} />
      <Input label="Processing days" type="number" value={v.processingDays} onChange={(e) => set('processingDays', Number(e.target.value))} />
      <div className="space-y-2">
        <Toggle label="Cash on delivery available" checked={v.codAvailable} onChange={(c) => set('codAvailable', c)} />
        <Toggle label="International shipping" checked={v.intlEnabled} onChange={(c) => set('intlEnabled', c)} />
      </div>
    </Section>
  );
}

function PaymentsPanel({ v, set }) {
  return (
    <Section title="Payments & tax" hint="Enabled gateways and applicable tax.">
      <div className="sm:col-span-2 space-y-2">
        <Toggle label="Razorpay (cards / UPI / wallets)" checked={v.razorpayEnabled} onChange={(c) => set('razorpayEnabled', c)} />
        <Toggle label="Cash on delivery" checked={v.codEnabled} onChange={(c) => set('codEnabled', c)} />
      </div>
      <Input label="Tax rate (%)" type="number" value={v.taxRate} onChange={(e) => set('taxRate', Number(e.target.value))} />
      <div className="sm:col-span-1"><Toggle label="Tax inclusive in price" checked={v.taxInclusive} onChange={(c) => set('taxInclusive', c)} /></div>
    </Section>
  );
}

function NotificationsPanel({ v, set }) {
  return (
    <Section title="Transactional emails" hint="Choose which automated emails to send.">
      <div className="sm:col-span-2 space-y-2">
        <Toggle label="Order confirmation" checked={v.orderConfirmation} onChange={(c) => set('orderConfirmation', c)} />
        <Toggle label="Shipping & delivery updates" checked={v.shippingUpdates} onChange={(c) => set('shippingUpdates', c)} />
        <Toggle label="Marketing newsletters" checked={v.marketingEmails} onChange={(c) => set('marketingEmails', c)} />
        <Toggle label="Low-stock alerts to admins" checked={v.lowStockAlerts} onChange={(c) => set('lowStockAlerts', c)} />
      </div>
    </Section>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-ink-100 bg-cream-50/60 px-3 py-2.5 text-sm">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={cx('relative inline-flex h-6 w-11 items-center rounded-full transition', checked ? 'bg-gold' : 'bg-ink-200')}>
        <span className={cx('inline-block h-5 w-5 rounded-full bg-white shadow transform transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </button>
    </label>
  );
}
