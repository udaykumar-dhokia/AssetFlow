// redux/slices/authSlice.js
// Manages authentication state: token, user profile, loading flags.
// Server data (assets, departments, etc.) NEVER goes here — use TanStack Query.

import { createSlice } from '@reduxjs/toolkit'
import { destroySocket } from '@/socket'

const TOKEN_KEY = 'assetflow_token'
const USER_KEY = 'assetflow_user'

// ── Initial State ────────────────────────────────────────────
const initialState = {
  /** JWT token (also persisted in localStorage) */
  token: localStorage.getItem(TOKEN_KEY) ?? null,

  /** Logged-in user object */
  user: localStorage.getItem(USER_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null,

  /** True while verifying token on app startup */
  isInitializing: true,

  /** True during login/logout API calls */
  isAuthLoading: false,
}

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Called after successful login.
     * Persists token to localStorage.
     */
    loginSuccess(state, action) {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      state.isAuthLoading = false
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    /**
     * Update user profile (e.g. after /me fetch or profile edit).
     */
    setUser(state, action) {
      state.user = action.payload
      state.isInitializing = false
    },

    /**
     * Mark app initialization as complete (used by AppInitializer).
     */
    setInitialized(state) {
      state.isInitializing = false
    },

    /**
     * Set auth loading state during login/logout requests.
     */
    setAuthLoading(state, action) {
      state.isAuthLoading = action.payload
    },

    /**
     * Clear auth state and destroy socket on logout.
     */
    logout(state) {
      state.token = null
      state.user = null
      state.isInitializing = false
      state.isAuthLoading = false
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      destroySocket()
    },
  },
})

export const {
  loginSuccess,
  setUser,
  setInitialized,
  setAuthLoading,
  logout,
} = authSlice.actions

// ── Selectors ─────────────────────────────────────────────────
export const selectToken          = (state) => state.auth.token
export const selectUser           = (state) => state.auth.user
export const selectUserRole       = (state) => state.auth.user?.role
export const selectIsInitializing = (state) => state.auth.isInitializing
export const selectIsAuthLoading  = (state) => state.auth.isAuthLoading
export const selectIsAuthenticated = (state) => !!state.auth.token

export default authSlice.reducer
