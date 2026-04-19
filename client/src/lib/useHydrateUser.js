import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout, selectUser } from '../store/slices/authSlice.js';
import { authApi } from './api/auth.js';

/**
 * On app mount, if we have a persisted user, refresh from /me.
 * Axios interceptor handles refresh-on-401 transparently.
 */
export default function useHydrateUser() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!user) return;
    authApi.me()
      .then((data) => {
        if (data?.user) dispatch(setUser(data.user));
      })
      .catch(() => {
        dispatch(logout());
      });
  }, [dispatch, user]);
}
