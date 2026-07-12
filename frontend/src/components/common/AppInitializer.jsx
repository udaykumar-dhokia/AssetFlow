

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

        // Temporary: trust the existing token, mark initialized.
        // setUser is not called here intentionally — user data will come
        // from the /me endpoint. For now, setInitialized unblocks the UI.
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
