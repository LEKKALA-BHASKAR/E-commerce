import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { selectCartCount } from '../../store/slices/cartSlice.js';
import { openCart, openMobileNav, openSearch } from '../../store/slices/uiSlice.js';

const links = [
  { to: '/shop?category=rice', label: 'Rice' },
  { to: '/shop?category=grains', label: 'Grains' },
  { to: '/shop?category=spices', label: 'Spices' },
  { to: '/shop?category=pantry', label: 'Pantry' },
  { to: '/shop?category=deals', label: 'Deals' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-ink-100">
      <div className="container flex items-center justify-between gap-4 py-4">
        <button
          className="lg:hidden -ml-2 p-2 rounded-md hover:bg-cream-200 text-ink-700"
          onClick={() => dispatch(openMobileNav())}
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="font-display italic text-2xl tracking-tight text-gold">
          Sahara Groceries
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative py-1 transition-colors hover:text-gold ${isActive ? 'text-gold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-gold' : 'text-ink-700'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 text-ink-700">
          <button onClick={() => dispatch(openSearch())} aria-label="Search" className="p-2 rounded-md hover:bg-cream-200 hover:text-gold">
            <Search size={18} />
          </button>
          <button onClick={() => dispatch(openCart())} aria-label="Cart" className="relative p-2 rounded-md hover:bg-cream-200 hover:text-gold">
            <ShoppingCart size={18} className="text-gold" />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </button>
          <Link to="/account" aria-label="Account" className="p-2 rounded-md hover:bg-cream-200 hover:text-gold">
            <User size={18} className="text-gold" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Badge({ children }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
      {children}
    </span>
  );
}
