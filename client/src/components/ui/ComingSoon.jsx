import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import { Construction } from 'lucide-react';

export default function ComingSoon({ title, intent = 'storefront' }) {
  return (
    <div className={intent === 'admin' ? '' : 'container py-24'}>
      <div className="glass-strong mx-auto max-w-xl rounded-3xl p-10 text-center">
        <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-gold/15 text-gold">
          <Construction size={22} />
        </span>
        <h1 className="mt-5 font-display text-3xl">{title}</h1>
        <p className="mt-3 text-sm text-ink-300">
          This section is scaffolded — wiring up in the next phase.
        </p>
        <div className="mt-6">
          <Link to={intent === 'admin' ? '/admin' : '/'}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
