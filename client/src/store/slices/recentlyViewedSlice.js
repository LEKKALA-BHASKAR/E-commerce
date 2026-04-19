import { createSlice } from '@reduxjs/toolkit';

const MAX = 12;

const slice = createSlice({
  name: 'recentlyViewed',
  initialState: { ids: [] },
  reducers: {
    pushViewed(state, { payload }) {
      state.ids = [payload, ...state.ids.filter((id) => id !== payload)].slice(0, MAX);
    },
    clearViewed(state) {
      state.ids = [];
    },
  },
});

export const { pushViewed, clearViewed } = slice.actions;
export default slice.reducer;
export const selectRecentlyViewedIds = (s) => s.recentlyViewed.ids;
