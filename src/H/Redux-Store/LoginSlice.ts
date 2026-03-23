import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface LoginState {
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoginModalOpen: boolean;
}

const initialState: LoginState = {
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,
  isLoginModalOpen: false,
};

export const LoginSlice = createSlice({
  name: "Login",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
      state.error = null;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, openLoginModal, closeLoginModal } = LoginSlice.actions;
export default LoginSlice.reducer;
