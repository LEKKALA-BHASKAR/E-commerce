import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: {
    cartDrawerOpen: false,
    mobileNavOpen: false,
    searchOpen: false,
    quickViewProductId: null,
  },
  reducers: {
    openCart(s) { s.cartDrawerOpen = true; },
    closeCart(s) { s.cartDrawerOpen = false; },
    toggleCart(s) { s.cartDrawerOpen = !s.cartDrawerOpen; },
    openMobileNav(s) { s.mobileNavOpen = true; },
    closeMobileNav(s) { s.mobileNavOpen = false; },
    openSearch(s) { s.searchOpen = true; },
    closeSearch(s) { s.searchOpen = false; },
    openQuickView(s, { payload }) { s.quickViewProductId = payload; },
    closeQuickView(s) { s.quickViewProductId = null; },
  },
});

export const {
  openCart, closeCart, toggleCart,
  openMobileNav, closeMobileNav,
  openSearch, closeSearch,
  openQuickView, closeQuickView,
} = slice.actions;

export default slice.reducer;
