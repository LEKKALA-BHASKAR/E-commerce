import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

const isValidId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    toggleWishlist(state, { payload }) {
      // payload may be a string id (legacy) or a snapshot object {id, slug, name, price, image, brand}
      const snap = typeof payload === 'string' ? { id: payload } : payload;
      const id = snap.id;
      const idx = state.items.findIndex((it) => it.id === id);
      if (idx >= 0) state.items.splice(idx, 1);
      else state.items.unshift(snap);
    },
    removeWishlist(state, { payload }) {
      state.items = state.items.filter((it) => it.id !== payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (_state, action) => {
      const incoming = action.payload?.wishlist;
      if (!incoming) return;
      return { items: (incoming.items || []).filter((it) => isValidId(it.id)) };
    });
  },
});

export const { toggleWishlist, removeWishlist, clearWishlist } = slice.actions;
export default slice.reducer;

export const selectWishlistItems = (s) => s.wishlist.items || [];
export const selectWishlistIds = (s) => (s.wishlist.items || []).map((it) => it.id);
export const selectWishlistCount = (s) => (s.wishlist.items || []).length;
export const selectIsWishlisted = (id) => (s) => (s.wishlist.items || []).some((it) => it.id === id);
