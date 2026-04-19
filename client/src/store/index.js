import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice.js';
import cartReducer from './slices/cartSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import uiReducer from './slices/uiSlice.js';
import recentlyViewedReducer from './slices/recentlyViewedSlice.js';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  ui: uiReducer,
  recentlyViewed: recentlyViewedReducer,
});

const persistConfig = {
  key: 'luxe-root',
  version: 1,
  storage,
  whitelist: ['cart', 'wishlist', 'recentlyViewed', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
