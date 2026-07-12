// routes/PublicRoute.jsx
// Redirects authenticated users away from auth pages (login, register).

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import GlobalLoader from '@/components/loaders/GlobalLoader'

/**
 * Wraps public auth routes (login, register, etc.).
 * If user is already authenticated, redirect to dashboard.
 */
export default function PublicRoute() {
  const { isAuthenticated, isInitializing } = useAuth()

  if (isInitializing) {
    return <GlobalLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
