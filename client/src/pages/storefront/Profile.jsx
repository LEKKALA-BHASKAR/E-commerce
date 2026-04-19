import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, Lock, MapPin, Bell, Save, Plus, Trash2, Edit3, Star, ShieldAlert,
} from 'lucide-react';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { selectUser, setUser } from '../../store/slices/authSlice.js';
import { cx } from '../../lib/formatters.js';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const SAMPLE_ADDRESSES = [
  { id: 'a1', label: 'Home', name: 'You', line1: '14 Pantry Lane, Apt 3B', city: 'Bengaluru', state: 'Karnataka', zip: '560001', country: 'India', phone: '+91 80 4000 1234', isDefault: true },
];

export default function Profile() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#addresses') return 'addresses';
    return 'profile';
  });

  return (
    <section className="container py-10 lg:py-14">
      <Link to="/account" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-gold">
        <ArrowLeft size={12} /> Back to account
      </Link>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Profile & settings</h1>
      <p className="mt-1 text-sm text-ink-400">Manage how Sahara reaches you, and where we ship.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="space-y-1 rounded-2xl border border-ink-100 bg-white p-2 shadow-card">
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
        </aside>

        <div className="lg:col-span-9 space-y-6">
          {tab === 'profile' && <ProfilePanel user={user} onSave={(u) => dispatch(setUser(u))} />}
          {tab === 'addresses' && <AddressesPanel />}
          {tab === 'security' && <SecurityPanel />}
          {tab === 'notifications' && <NotificationsPanel />}
        </div>
      </div>
    </section>
  );
}

// -- Profile basics ------------------------------------------------------
function ProfilePanel({ user, onSave }) {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  }, [user, reset]);

  const submit = (values) => {
    onSave({ ...user, ...values });
    toast.success('Profile updated');
    reset(values);
  };

  const initials = (user?.name || 'You').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
      <h2 className="font-display text-2xl mb-1">About you</h2>
      <p className="text-xs text-ink-400 mb-6">Used on receipts and shipping labels.</p>

      <div className="flex items-center gap-4 mb-6">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold font-display text-2xl">
          {initials}
        </div>
        <div>
          <Button type="button" variant="ghost" size="sm">Change avatar</Button>
          <p className="text-xs text-ink-400 mt-1">PNG or JPG, up to 2MB.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
        <Input label="Phone" type="tel" placeholder="+91 9876543210" {...register('phone')} />
        <div>
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">Preferred language</span>
          <select className="input"><option>English</option><option>हिन्दी</option><option>Français</option></select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => reset()} disabled={!isDirty}>Discard</Button>
        <Button type="submit" disabled={!isDirty}><Save size={14} /> Save changes</Button>
      </div>
    </form>
  );
}

// -- Addresses -----------------------------------------------------------
function AddressesPanel() {
  const [list, setList] = useState(SAMPLE_ADDRESSES);
  const [editing, setEditing] = useState(null);

  const open = (a) =>
    setEditing(a || { id: `a${Date.now()}`, label: '', name: '', line1: '', city: '', state: '', zip: '', country: 'India', phone: '', isDefault: list.length === 0, _new: true });

  const save = (e) => {
    e.preventDefault();
    setList((rows) => {
      let next;
      if (editing._new) next = [...rows, { ...editing, _new: undefined }];
      else next = rows.map((r) => (r.id === editing.id ? editing : r));
      if (editing.isDefault) next = next.map((r) => ({ ...r, isDefault: r.id === editing.id }));
      return next;
    });
    toast.success(editing._new ? 'Address added' : 'Address updated');
    setEditing(null);
  };

  const remove = (id) => {
    if (!confirm('Remove this address?')) return;
    setList((rows) => rows.filter((r) => r.id !== id));
    toast.success('Address removed');
  };

  const setDefault = (id) => {
    setList((rows) => rows.map((r) => ({ ...r, isDefault: r.id === id })));
    toast.success('Default address updated');
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl">Saved addresses</h2>
          <p className="text-xs text-ink-400 mt-1">{list.length} address{list.length !== 1 ? 'es' : ''} on file</p>
        </div>
        <Button onClick={() => open(null)}><Plus size={14} /> Add address</Button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12">
          <MapPin size={36} className="mx-auto text-ink-300" />
          <p className="mt-3 text-sm text-ink-500">No addresses yet. Add one to speed up checkout.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="rounded-xl border border-ink-100 bg-cream-50/60 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium inline-flex items-center gap-2">
                    {a.label || 'Address'}
                    {a.isDefault && <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-medium text-gold-600"><Star size={10} /> Default</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-ink-400">
                  <button onClick={() => open(a)} className="p-1.5 rounded hover:bg-cream-100 hover:text-ink-800"><Edit3 size={13} /></button>
                  <button onClick={() => remove(a.id)} className="p-1.5 rounded hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-sm text-ink-700">{a.name}</p>
              <p className="text-sm text-ink-500">{a.line1}</p>
              <p className="text-sm text-ink-500">{a.city}, {a.state} {a.zip}</p>
              <p className="text-sm text-ink-500">{a.country}</p>
              {a.phone && <p className="text-xs text-ink-400 mt-1">{a.phone}</p>}
              {!a.isDefault && (
                <button onClick={() => setDefault(a.id)} className="mt-3 text-xs text-gold hover:underline">
                  Set as default
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-800/40 backdrop-blur-sm p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
            <h2 className="font-display text-2xl mb-1">{editing._new ? 'New address' : 'Edit address'}</h2>
            <p className="text-xs text-ink-400 mb-5">Used at checkout & shipping.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Label" placeholder="Home / Office" value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
              <Input label="Recipient" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <div className="sm:col-span-2">
                <Input label="Street address" value={editing.line1} onChange={(e) => setEditing({ ...editing, line1: e.target.value })} />
              </div>
              <Input label="City" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} />
              <Input label="State" value={editing.state} onChange={(e) => setEditing({ ...editing, state: e.target.value })} />
              <Input label="ZIP / PIN" value={editing.zip} onChange={(e) => setEditing({ ...editing, zip: e.target.value })} />
              <Input label="Country" value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} />
              <div className="sm:col-span-2">
                <Input label="Phone" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 text-sm">
                <input type="checkbox" className="check" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
                Set as default shipping address
              </label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">{editing._new ? 'Add address' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// -- Security ------------------------------------------------------------
function SecurityPanel() {
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const submit = (values) => {
    if (values.next !== values.confirm) {
      toast.error('New passwords don’t match');
      return;
    }
    toast.success('Password updated');
    reset();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
        <h2 className="font-display text-2xl mb-1">Change password</h2>
        <p className="text-xs text-ink-400 mb-6">Choose a long, unique password — at least 8 characters.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Current password" type="password" autoComplete="current-password" error={errors.current?.message} {...register('current', { required: 'Required' })} />
          <Input label="New password" type="password" autoComplete="new-password" error={errors.next?.message} {...register('next', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
          <Input label="Confirm new" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm', { required: 'Required' })} />
        </div>
        <div className="mt-6 flex items-center justify-end">
          <Button type="submit"><Save size={14} /> Update password</Button>
        </div>
      </form>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
        <h2 className="font-display text-2xl mb-1">Two-factor authentication</h2>
        <p className="text-xs text-ink-400 mb-6">Add an extra layer with an authenticator app.</p>
        <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-cream-50/60 p-4">
          <div>
            <p className="font-medium">Authenticator app</p>
            <p className="text-xs text-ink-400">Use Google Authenticator, 1Password, or similar.</p>
          </div>
          <Button variant="ghost">Enable</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-600"><ShieldAlert size={18} /></span>
          <div className="flex-1">
            <h2 className="font-display text-xl text-red-700">Delete account</h2>
            <p className="text-sm text-red-600/80 mt-1">Permanently remove your account, orders, and saved addresses. This cannot be undone.</p>
          </div>
          <Button variant="danger" onClick={() => confirm('Permanently delete your account?') && toast.success('Request submitted')}>
            <Trash2 size={14} /> Delete account
          </Button>
        </div>
      </div>
    </div>
  );
}

// -- Notifications -------------------------------------------------------
function NotificationsPanel() {
  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    newDrops: true,
    harvestNotes: false,
    sms: true,
    whatsapp: false,
    weekly: true,
  });

  const labels = {
    orderUpdates: ['Order updates', 'Confirmations, shipping, and delivery emails'],
    newDrops: ['New harvest drops', 'Be first to know when fresh stock lands'],
    harvestNotes: ['Harvest notes (monthly)', 'A short letter from our farmers and chefs'],
    sms: ['SMS alerts', 'Critical order updates over SMS'],
    whatsapp: ['WhatsApp updates', 'Conversational order tracking'],
    weekly: ['Weekly digest', 'A roundup every Monday morning'],
  };

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-card">
      <h2 className="font-display text-2xl mb-1">Notification preferences</h2>
      <p className="text-xs text-ink-400 mb-6">Pick what you want to hear from us about — and how.</p>
      <div className="space-y-3">
        {Object.entries(prefs).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between rounded-xl border border-ink-100 bg-cream-50/60 px-4 py-3">
            <div>
              <p className="font-medium">{labels[k][0]}</p>
              <p className="text-xs text-ink-400">{labels[k][1]}</p>
            </div>
            <Switch checked={v} onChange={(c) => { setPrefs({ ...prefs, [k]: c }); toast.success('Preferences updated'); }} />
          </label>
        ))}
      </div>
    </div>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition',
        checked ? 'bg-gold' : 'bg-ink-200'
      )}
    >
      <span className={cx('inline-block h-5 w-5 rounded-full bg-white shadow transform transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  );
}
