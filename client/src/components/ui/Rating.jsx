import { Star } from 'lucide-react';
import { cx } from '../../lib/formatters.js';

export default function Rating({ value = 0, size = 14, count, className = '' }) {
  const filled = Math.round(value);
  return (
    <span className={cx('inline-flex items-center gap-1', className)}>
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < filled ? 'fill-gold text-gold' : 'text-ink-400'}
            strokeWidth={1.5}
          />
        ))}
      </span>
      <span className="text-xs text-ink-300">
        {value.toFixed(1)}
        {count != null && <span className="ml-1 opacity-70">({count})</span>}
      </span>
    </span>
  );
}
