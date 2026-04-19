import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tags,
  Ticket, BarChart3, Settings, Menu, X, LogOut, Search, Bell, Wheat, Star,
} from 'lucide-react';
import { selectUser, logout as logoutAction } from '../../store/slices/authSlice.js';
import { authApi } from '../../lib/api/auth.js';
import { cx } from '../../lib/formatters.js';
import RoleGuard from '../../components/auth/RoleGuard.jsx';

const STAFF_ROLES = ['superadmin', 'manager', 'editor'];

const nav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  return (
    <RoleGuard roles={STAFF_ROLES}>
      <AdminShell />
    </RoleGuard>
  );
}

function AdminShell() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    try { await authApi.logout(); } catch {}
    dispatch(logoutAction());
    toast.success('Signed out');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream-50 text-ink-800">
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink-800/40 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-ink-100 bg-white transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-ink-100">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold/15 text-gold">
              <Wheat size={16} />
            </span>
            <span className="font-display text-xl leading-none">
              Sahara <span className="text-[10px] uppercase tracking-[0.25em] text-ink-400 ml-1">admin</span>
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-cream-100">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition mb-0.5',
                  isActive
                    ? 'bg-gold/10 text-gold-600 font-medium'
                    : 'text-ink-500 hover:bg-cream-100 hover:text-ink-800'
                )
              }
            >
              <n.icon size={16} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-ink-100 p-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-500 hover:bg-cream-100 hover:text-ink-800">
            <LogOut size={16} className="rotate-180" /> Storefront
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-500 hover:bg-cream-100 hover:text-ink-800">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-100 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-cream-100"><Menu size={18} /></button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input className="input pl-9 py-2.5" placeholder="Search products, orders, customers…" />
            </div>
          </div>
          <button className="relative p-2 rounded-full hover:bg-cream-100" aria-label="Alerts">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
          </button>
          <div className="flex items-center gap-3 pl-3 border-l border-ink-100">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-tight">{user?.name || 'Super Admin'}</p>
              <p className="text-[10px] uppercase tracking-wider text-gold">{user?.role || 'superadmin'}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-gold font-display">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
