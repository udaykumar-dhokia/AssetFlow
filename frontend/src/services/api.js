// services/api.js
// Axios instance — shared HTTP client for the entire app.
//
// Pages NEVER call axios directly.
// All API calls go through service files that import this instance.

import axios from 'axios'
import env from '@/config/env'
import { store } from '@/redux/store'
import { logout } from '@/redux/slices/authSlice'

// ── Create Instance ───────────────────────────────────────────
const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ── Request Interceptor ───────────────────────────────────────
// Attach Bearer token from Redux auth state to every request.
api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth?.token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// ── Response Interceptor ──────────────────────────────────────
// Handle global errors: 401 → logout, 403, 500, network errors.
api.interceptors.response.use(
  // Success: pass through the response data
  (response) => response,

  // Error: handle globally
  async (error) => {
    const { response } = error

    if (!response) {
      // Network error or server down
      console.error('[API] Network error:', error.message)
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    const { status, data } = response

    switch (status) {
      case 401: {
        // Only force logout if a token exists (session expired).
        // A 401 on login itself (wrong password) should NOT trigger logout.
        const hasToken = !!store.getState().auth?.token
        if (hasToken) store.dispatch(logout())
        return Promise.reject(new Error(data?.message ?? 'Session expired. Please log in again.'))
      }

      case 403:
        return Promise.reject(new Error(data?.message ?? 'You do not have permission to perform this action.'))

      case 404:
        return Promise.reject(new Error(data?.message ?? 'The requested resource was not found.'))

      case 422:
        // Validation error from backend
        return Promise.reject(error)

      case 500:
      case 502:
      case 503:
        return Promise.reject(new Error(data?.message ?? 'A server error occurred. Please try again later.'))

      default:
        return Promise.reject(error)
    }
  },
)

export default api
