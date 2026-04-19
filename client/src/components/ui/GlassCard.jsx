import { cx } from '../../lib/formatters.js';
export default function GlassCard({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={cx('glass p-6', className)} {...rest}>
      {children}
    </Tag>
  );
}
