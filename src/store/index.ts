import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer, { setCredentials, logout } from './authSlice';
import { api } from './api';

// `me`, `myDocuments`, etc. are cached per-endpoint, not per-user — without this,
// switching accounts in the same tab (login as A, logout, login as B) can briefly
// serve the previous user's cached data until something else invalidates it.
const resetApiCacheOnAuthChange: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);
  if (setCredentials.match(action) || logout.match(action)) {
    storeApi.dispatch(api.util.resetApiState());
  }
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware, resetApiCacheOnAuthChange),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;