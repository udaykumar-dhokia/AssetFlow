// routes/index.jsx
// Root router configuration.
// All pages are lazy-loaded via React.lazy().
// PageLoader is used as the Suspense fallback.

import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute    from './PublicRoute'
import RoleGuard      from './RoleGuard'
import PageLoader     from '@/components/loaders/PageLoader'
import AppLayout      from '@/layouts/AppLayout'
import AuthLayout     from '@/layouts/AuthLayout'

// ── Lazy Pages ────────────────────────────────────────────────
const LoginPage        = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage     = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const NotFoundPage     = lazy(() => import('@/pages/NotFoundPage'))

// Feature pages (stubs — will be implemented in later sprints)
const DashboardPage    = lazy(() => import('@/pages/dashboard/DashboardPage'))
const OrgSetupPage     = lazy(() => import('@/pages/org-setup/OrgSetupPage'))
const AssetsPage       = lazy(() => import('@/pages/assets/AssetsPage'))
const AllocationPage   = lazy(() => import('@/pages/allocation/AllocationPage'))
const BookingPage      = lazy(() => import('@/pages/booking/BookingPage'))
const MaintenancePage  = lazy(() => import('@/pages/maintenance/MaintenancePage'))
const AuditPage        = lazy(() => import('@/pages/audit/AuditPage'))
const ReportsPage      = lazy(() => import('@/pages/reports/ReportsPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))

// ── Suspense Wrapper ──────────────────────────────────────────
function SuspenseFallback() {
  return <PageLoader />
}

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public Auth Routes ──────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      {
        element: (
          <AuthLayout>
            <Suspense fallback={<SuspenseFallback />}>
              <LoginPage />
            </Suspense>
          </AuthLayout>
        ),
        path: ROUTES.LOGIN,
      },
      {
        element: (
          <AuthLayout>
            <Suspense fallback={<SuspenseFallback />}>
              <RegisterPage />
            </Suspense>
          </AuthLayout>
        ),
        path: ROUTES.REGISTER,
      },
      {
        element: (
          <AuthLayout>
            <Suspense fallback={<SuspenseFallback />}>
              <ForgotPasswordPage />
            </Suspense>
          </AuthLayout>
        ),
        path: ROUTES.FORGOT_PASSWORD,
      },
    ],
  },

  // ── Protected App Routes ────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.ORG_SETUP,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <Suspense fallback={<SuspenseFallback />}>
                  <OrgSetupPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: ROUTES.ASSETS,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <AssetsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.ALLOCATION,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <AllocationPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.BOOKING,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <BookingPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.MAINTENANCE,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <MaintenancePage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.AUDIT,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}>
                <Suspense fallback={<SuspenseFallback />}>
                  <AuditPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: ROUTES.REPORTS,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD]}>
                <Suspense fallback={<SuspenseFallback />}>
                  <ReportsPage />
                </Suspense>
              </RoleGuard>
            ),
          },
          {
            path: ROUTES.NOTIFICATIONS,
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <NotificationsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────
  {
    path: ROUTES.NOT_FOUND,
    element: (
      <Suspense fallback={<SuspenseFallback />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
