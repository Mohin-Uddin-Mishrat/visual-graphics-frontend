import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken?: string | null; user: AuthUser }>
    ) => {
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.user = action.payload.user;
      state.isHydrated = true;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isHydrated = true;
    },
    setAuthHydrated: (state) => {
      state.isHydrated = true;
    },
  },
});

export const { setCredentials, clearAuth, setAuthHydrated } = authSlice.actions;
export const authReducer = authSlice.reducer;
