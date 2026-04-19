import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser } from '../../store/slices/authSlice.js';

/**
 * Gate children behind a role allow-list.
 * @param {{roles: string[], redirectTo?: string, children: React.ReactNode}} props
 */
export default function RoleGuard({ roles, redirectTo = '/admin/login', children }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
