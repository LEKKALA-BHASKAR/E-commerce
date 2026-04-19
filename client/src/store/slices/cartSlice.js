import { createSlice, createSelector } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

const initialState = { items: [], coupon: null };

const keyOf = (productId, variant) => `${productId}::${variant?.sku || 'default'}`;
const isValidId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: {
      reducer(state, { payload }) {
        const key = keyOf(payload.productId, payload.variant);
        const existing = state.items.find((i) => i.key === key);
        if (existing) existing.qty = Math.min(99, existing.qty + payload.qty);
        else state.items.push({ ...payload, key });
      },
      prepare(item) {
        return { payload: { qty: 1, ...item } };
      },
    },
    updateQty(state, { payload }) {
      const item = state.items.find((i) => i.key === payload.key);
      if (item) item.qty = Math.max(1, Math.min(99, payload.qty));
    },
    removeItem(state, { payload }) {
      state.items = state.items.filter((i) => i.key !== payload);
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },
    applyCoupon(state, { payload }) {
      state.coupon = payload;
    },
    removeCoupon(state) {
      state.coupon = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      const incoming = action.payload?.cart;
      if (!incoming) return;
      const items = (incoming.items || []).filter((i) => isValidId(i.productId));
      return { ...incoming, items, coupon: incoming.coupon || null };
    });
  },
});

export const { addItem, updateQty, removeItem, clearCart, applyCoupon, removeCoupon } = slice.actions;
export default slice.reducer;

export const selectCartItems = (s) => s.cart.items;
export const selectCoupon = (s) => s.cart.coupon;
export const selectCartCount = createSelector(selectCartItems, (items) =>
  items.reduce((n, i) => n + i.qty, 0)
);
export const selectCartSubtotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.price * i.qty, 0)
);
export const selectCartTotals = createSelector(
  selectCartSubtotal,
  selectCoupon,
  (subtotal, coupon) => {
    let discount = 0;
    if (coupon) {
      if (coupon.type === 'percent') discount = (subtotal * coupon.value) / 100;
      else if (coupon.type === 'fixed') discount = coupon.value;
    }
    discount = Math.min(subtotal, discount);
    const taxableBase = subtotal - discount;
    const tax = +(taxableBase * 0.08).toFixed(2);
    const shipping = subtotal > 200 || subtotal === 0 ? 0 : 12;
    const total = +(taxableBase + tax + shipping).toFixed(2);
    return { subtotal, discount, tax, shipping, total };
  }
);
