import { cx } from '../../lib/formatters.js';
export default function Skeleton({ className = '', ...rest }) {
  return <div className={cx('skeleton', className)} {...rest} />;
}
