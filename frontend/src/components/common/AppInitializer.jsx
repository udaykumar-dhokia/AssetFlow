// components/common/AppInitializer.jsx
// Runs once on app startup to resolve the authentication state.
//
// Flow:
//   1. If a token exists in localStorage → call GET /auth/me to validate it.
//      On success: dispatch setUser(user) → isInitializing = false, user populated.
//      On failure (401/network): dispatch logout() → clears token, redirects to login.
//   2. If no token → dispatch setInitialized() immediately → isInitializing = false.
//
// When the backend is ready, uncomment the authService.me() call below
// and remove the setTimeout stub.

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectToken, setInitialized, setUser, logout } from '@/redux/slices/authSlice'

// TODO: import authService from '@/services/authService' when backend is ready

export default function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const token    = useSelector(selectToken)

  useEffect(() => {
    async function init() {
      if (!token) {
        // No token — nothing to verify, mark as ready immediately
        dispatch(setInitialized())
        return
      }

      try {
        // ── STUB: replace with real call when backend is connected ──
        // const user = await authService.me()
        // dispatch(setUser(user))
        // ────────────────────────────────────────────────────────────

        // Temporary: Decode token to get user info until /me is ready
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          dispatch(setUser({ 
            id: payload.sub, 
            role: payload.role, 
            name: 'User' // Default fallback since name isn't in token
          }))
        } catch (e) {
          console.error('Failed to decode token on init')
        }
        dispatch(setInitialized())
      } catch {
        // Token invalid or expired — force logout
        dispatch(logout())
      }
    }

    init()
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return children
}
