import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, Heart, MapPin, User, ShoppingBag, Wallet, Sparkles,
  ChevronRight, LogOut, Gift, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import { selectUser, logout as logoutAction } from '../../store/slices/authSlice.js';
import { selectWishlistItems } from '../../store/slices/wishlistSlice.js';
import { authApi } from '../../lib/api/auth.js';
import { checkoutApi } from '../../lib/api/checkout.js';
import { formatPrice, formatDate, cx } from '../../lib/formatters.js';

const STATUS_TONE = {
  pending: 'bg-cream-200 text-ink-500 border-ink-200',
  paid: 'bg-gold/10 text-gold-600 border-gold/30',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-ink-100 text-ink-500 border-ink-200',
};

export default function AccountDashboard() {
  const user = useSelector(selectUser);
  const wishlist = useSelector(selectWishlistItems);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    checkoutApi.listOrders()
      .then(({ orders }) => setOrders(orders || []))
      .catch(() => setOrders([]));
  }, []);

  const stats = useMemo(() => {
    const list = orders || [];
    return {
      orders: list.length,
      spend: list.reduce((s, o) => s + (o.total || 0), 0),
      pending: list.filter((o) => ['pending', 'paid', 'processing', 'shipped'].includes(o.status)).length,
    };
  }, [orders]);

  const recent = (orders || []).slice(0, 3);

  const signOut = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logoutAction());
    toast.success('Signed out');
  };

  const initials = (user?.name || 'You').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const greeting = greetingFor(new Date());

  return (
    <section className="container py-10 lg:py-14">
      {/* Greeting header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold font-display text-xl">
            {initials}
          </div>
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="font-display text-3xl sm:text-4xl mt-1">
              {greeting}, {user?.name?.split(' ')[0] || 'friend'}.
            </h1>
            <p className="text-sm text-ink-400 mt-1">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-md border border-ink-200 px-4 py-2 text-sm text-ink-700 hover:border-gold hover:text-gold transition"
        >
          <LogOut size={14} /> Sign out
        </button>
      </header>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Stat icon={ShoppingBag} label="Orders" value={stats.orders} sub={stats.pending ? `${stats.pending} in progress` : 'All up to date'} />
        <Stat icon={Wallet} label="Lifetime spend" value={formatPrice(stats.spend)} sub="Across all orders" />
        <Stat icon={Heart} label="Wishlist" value={wishlist.length} sub={wishlist.length ? 'Saved for later' : 'Empty for now'} />
        <Stat icon={Sparkles} label="Member since" value={user?.createdAt ? formatDate(user.createdAt) : '2026'} sub="Thanks for being here" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <aside className="space-y-2">
          <NavTile to="/account/orders" icon={Package} title="Orders" body="Track shipments & invoices" />
          <NavTile to="/account/profile" icon={User} title="Profile" body="Name, email, password" />
          <NavTile to="/wishlist" icon={Heart} title="Wishlist" body={`${wishlist.length} saved`} />
          <NavTile to="/account/profile#addresses" icon={MapPin} title="Addresses" body="Shipping & billing" />
        </aside>

        {/* Recent orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl">Recent orders</h2>
                <p className="text-xs text-ink-400">Your last few baskets</p>
              </div>
              <Link to="/account/orders" className="text-xs text-gold hover:underline inline-flex items-center gap-1">
                See all <ChevronRight size={12} />
              </Link>
            </div>

            {orders === null ? (
              <ul className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="h-20 rounded-xl skeleton" />
                ))}
              </ul>
            ) : recent.length === 0 ? (
              <div className="text-center py-10">
                <Package size={36} className="mx-auto text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">No orders yet — your pantry awaits.</p>
                <Link to="/shop" className="mt-4 inline-block">
                  <Button>Begin shopping</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {recent.map((o) => (
                  <li key={o.id}>
                    <Link
                      to={`/account/orders/${o.id}`}
                      className="group flex items-center gap-4 rounded-xl border border-ink-100 bg-cream-50/60 p-4 transition hover:border-gold/40 hover:bg-cream-50"
                    >
                      <div className="flex -space-x-2">
                        {(o.items || []).slice(0, 3).map((it, i) => (
                          <img key={i} src={it.image} alt="" className="h-11 w-11 rounded-lg border-2 border-white object-cover" />
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{o.orderNumber}</p>
                        <p className="text-xs text-ink-400">
                          {formatDate(o.createdAt)} · {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(o.total)}</p>
                        <span className={cx('mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider', STATUS_TONE[o.status] || STATUS_TONE.pending)}>
                          {o.status}
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-ink-300 group-hover:text-gold" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Wishlist preview */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl">Saved for later</h2>
                <p className="text-xs text-ink-400">Things you’re thinking about</p>
              </div>
              <Link to="/wishlist" className="text-xs text-gold hover:underline inline-flex items-center gap-1">
                Open wishlist <ChevronRight size={12} />
              </Link>
            </div>
            {wishlist.length === 0 ? (
              <div className="text-center py-8">
                <Heart size={32} className="mx-auto text-ink-300" />
                <p className="mt-2 text-sm text-ink-500">Tap the heart on any product to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wishlist.slice(0, 4).map((it) => (
                  <Link
                    key={it.id}
                    to={`/product/${it.slug}`}
                    className="group rounded-xl overflow-hidden border border-ink-100 bg-cream-50/60 hover:border-gold/40 transition"
                  >
                    <div className="aspect-square overflow-hidden bg-cream-200">
                      {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover transition group-hover:scale-105" />}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{it.name}</p>
                      <p className="text-xs text-gold mt-0.5">{formatPrice(it.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Perks band */}
          <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
              <Gift size={18} />
            </span>
            <div className="flex-1">
              <p className="font-display text-lg">Member perks</p>
              <p className="text-sm text-ink-500 mt-0.5">
                Free shipping above ₹999, early access to harvest drops, and 5% back on every order over ₹2,500.
              </p>
            </div>
            <Link to="/shop" className="hidden sm:inline-block">
              <Button variant="ghost">Shop now</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Ico, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-400">{label}</p>
          <p className="font-display text-2xl mt-1">{value}</p>
          <p className="text-xs text-ink-400 mt-1 inline-flex items-center gap-1">
            <Clock size={11} /> {sub}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold"><Ico size={18} /></span>
      </div>
    </div>
  );
}

function NavTile({ to, icon: Ico, title, body }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 transition hover:border-gold/40 hover:bg-cream-50"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-cream-100 text-gold group-hover:bg-gold/15">
        <Ico size={16} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-ink-400 truncate">{body}</p>
      </div>
      <ChevronRight size={16} className="text-ink-300 group-hover:text-gold" />
    </Link>
  );
}

function greetingFor(date) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
