import { Link } from 'react-router-dom';

export default function Footer() {
  const links = [
    ['Sustainability', '/sustainability'],
    ['Wholesale', '/wholesale'],
    ['Store Locator', '/stores'],
    ['Contact Us', '/contact'],
    ['Privacy Policy', '/privacy'],
  ];
  return (
    <footer className="mt-24 border-t border-ink-100 bg-cream">
      <div className="container py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-sm">
        <Link to="/" className="font-display italic text-xl text-gold">Sahara Groceries</Link>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-ink-500">
          {links.map(([label, to]) => (
            <Link key={label} to={to} className="hover:text-gold transition-colors">{label}</Link>
          ))}
        </nav>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} Sahara Groceries. All rights reserved. Sun-baked quality delivered.</p>
      </div>
    </footer>
  );
}
