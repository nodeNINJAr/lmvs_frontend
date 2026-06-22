/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  _id: string;
  role: 'WORKER' | 'ADMIN';
  phone: string;
  fullName?: string;
  profileStatus?: string;
  trustScore?: number | null;
  [k: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('lmvs_token'),
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('lmvs_token', action.payload.token);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('lmvs_token');
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;