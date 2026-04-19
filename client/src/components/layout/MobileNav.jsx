import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Drawer from '../ui/Drawer.jsx';
import { closeMobileNav } from '../../store/slices/uiSlice.js';

const sections = [
  { title: 'Shop', items: [['New In', '/shop'], ['Best Sellers', '/shop?sort=popularity'], ['Sale', '/shop?sale=1']] },
  { title: 'Categories', items: [['Watches', '/shop?category=watches'], ['Leather', '/shop?category=leather'], ['Fragrance', '/shop?category=fragrance'], ['Jewellery', '/shop?category=jewellery'], ['Eyewear', '/shop?category=eyewear'], ['Home & Decor', '/shop?category=home']] },
  { title: 'Account', items: [['Sign in', '/login'], ['Wishlist', '/wishlist'], ['My orders', '/account/orders'], ['Profile', '/account/profile']] },
];

export default function MobileNav() {
  const open = useSelector((s) => s.ui.mobileNavOpen);
  const dispatch = useDispatch();
  return (
    <Drawer open={open} onClose={() => dispatch(closeMobileNav())} side="left" title="Menu">
      <nav className="p-5 space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-gold">{s.title}</p>
            <ul className="space-y-3 text-lg font-display">
              {s.items.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} onClick={() => dispatch(closeMobileNav())} className="hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Drawer>
  );
}
