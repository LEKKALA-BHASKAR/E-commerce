import { forwardRef } from 'react';
import { cx } from '../../lib/formatters.js';

const Input = forwardRef(function Input({ label, error, className = '', hint, ...rest }, ref) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300 dark:text-ink-300">{label}</span>}
      <input ref={ref} className={cx('input', error && 'border-red-400 focus:ring-red-400/30', className)} {...rest} />
      {hint && !error && <span className="mt-1 block text-xs text-ink-300">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
});
export default Input;
