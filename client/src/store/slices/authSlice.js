import { createSlice } from '@reduxjs/toolkit';

const initialState = { user: null, accessToken: null, status: 'idle' };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
    },
    setUser(state, { payload }) {
      state.user = payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setCredentials, setUser, logout } = slice.actions;
export default slice.reducer;

export const selectUser = (s) => s.auth.user;
export const selectIsAuthed = (s) => Boolean(s.auth.user);
export const selectIsAdmin = (s) =>
  ['superadmin', 'manager', 'editor'].includes(s.auth.user?.role);
