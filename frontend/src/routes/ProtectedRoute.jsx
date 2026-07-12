// routes/ProtectedRoute.jsx
// Redirects unauthenticated users to /login.
// Shows GlobalLoader while auth is initializing on app startup.

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import GlobalLoader from '@/components/loaders/GlobalLoader'

/**
 * Wraps protected app routes.
 * Redirects to /login if not authenticated.
 * Preserves attempted URL so we can redirect after login.
 */
export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <GlobalLoader />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}
