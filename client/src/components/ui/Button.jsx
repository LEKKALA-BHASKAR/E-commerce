import { cx } from '../../lib/formatters.js';

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-sm',
  };
  const variants = {
    primary: 'bg-gold text-white hover:bg-gold-600 hover:shadow-glow',
    ghost: 'border border-ink-200 bg-white text-ink-700 hover:border-gold hover:text-gold',
    outline: 'border border-gold text-gold hover:bg-gold hover:text-white',
    dark: 'bg-ink-800 text-cream hover:bg-ink-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <Tag
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
