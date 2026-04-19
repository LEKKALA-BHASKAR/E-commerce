import { formatPrice } from '../../lib/formatters.js';
export default function PriceTag({ price, compareAt, currency = 'USD', className = '' }) {
  const hasDiscount = compareAt && compareAt > price;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-display text-lg text-paper dark:text-paper">
        {formatPrice(price, currency)}
      </span>
      {hasDiscount && (
        <span className="text-xs line-through text-ink-300">{formatPrice(compareAt, currency)}</span>
      )}
      {hasDiscount && (
        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
          -{Math.round((1 - price / compareAt) * 100)}%
        </span>
      )}
    </span>
  );
}
