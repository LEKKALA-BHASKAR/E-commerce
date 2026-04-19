import { useState, useEffect } from 'react';

const messages = [
  'Complimentary shipping on orders over $50.',
  'New harvest: Persian Saffron now in stock.',
  'Sustainably sourced. Sun-baked quality.',
];

export default function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-ink-800 text-cream-100 text-[11px] uppercase tracking-[0.2em]">
      <div className="container flex items-center justify-center py-2">
        <span className="text-gold mr-2">✦</span>
        <span className="opacity-90">{messages[i]}</span>
      </div>
    </div>
  );
}
