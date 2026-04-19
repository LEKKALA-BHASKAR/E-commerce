import { cx } from '../../lib/formatters.js';
export default function SectionHeading({ eyebrow, title, sub, align = 'left', action }) {
  return (
    <header className={cx('mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', align === 'center' && 'sm:flex-col sm:items-center text-center')}>
      <div>
        {eyebrow && <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
        <h2 className="font-display text-3xl sm:text-4xl gold-underline">{title}</h2>
        {sub && <p className="mt-3 max-w-xl text-sm text-ink-300">{sub}</p>}
      </div>
      {action}
    </header>
  );
}
