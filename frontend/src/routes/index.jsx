// routes/index.jsx
// Root router configuration. All pages are lazy-loaded via React.lazy().

import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'

import ProtectedRoute  from './ProtectedRoute'
import PublicRoute     from './PublicRoute'
import RoleGuard       from './RoleGuard'
import PageLoader      from '@/components/loaders/PageLoader'
import AppLayout       from '@/layouts/AppLayout'
import AuthLayout      from '@/layouts/AuthLayout'

// ── Lazy Auth Pages ───────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'))
const VerifyEmailPage    = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage  = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const NotFoundPage       = lazy(() => import('@/pages/NotFoundPage'))

// ── Lazy App Pages ────────────────────────────────────────────
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const OrgSetupPage      = lazy(() => import('@/pages/org-setup/OrgSetupPage'))
const AssetsPage        = lazy(() => import('@/pages/assets/AssetsPage'))
const AssetDetailsPage  = lazy(() => import('@/pages/assets/AssetDetailsPage'))
const AllocationPage    = lazy(() => import('@/pages/allocation/AllocationPage'))
const BookingPage       = lazy(() => import('@/pages/booking/BookingPage'))
const MaintenancePage   = lazy(() => import('@/pages/maintenance/MaintenancePage'))
const AuditPage         = lazy(() => import('@/pages/audit/AuditPage'))
const ReportsPage       = lazy(() => import('@/pages/reports/ReportsPage'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'))

// ── Suspense wrapper ──────────────────────────────────────────
const Fallback = () => <PageLoader />

// ── Helper: wrap a page in AuthLayout + Suspense ──────────────
const authPage = (Page) => (
  <AuthLayout>
    <Suspense fallback={<Fallback />}>
      <Page />
    </Suspense>
  </AuthLayout>
)

// ── Helper: wrap a page in Suspense only ─────────────────────
const appPage = (Page) => (
  <Suspense fallback={<Fallback />}>
    <Page />
  </Suspense>
)

// ── Router ────────────────────────────────────────────────────
const router = createBrowserRouter([

  // ── Public Auth Routes ──────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.LOGIN,           element: authPage(LoginPage) },
      { path: ROUTES.REGISTER,        element: authPage(RegisterPage) },
      { path: ROUTES.VERIFY_EMAIL,    element: authPage(VerifyEmailPage) },
      { path: ROUTES.FORGOT_PASSWORD, element: authPage(ForgotPasswordPage) },
      { path: ROUTES.RESET_PASSWORD,  element: authPage(ResetPasswordPage) },
    ],
  },

  // ── Protected App Routes ────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD,     element: appPage(DashboardPage) },
          {
            path: ROUTES.ORG_SETUP,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                {appPage(OrgSetupPage)}
              </RoleGuard>
            ),
          },
          { path: ROUTES.ASSETS,        element: appPage(AssetsPage) },
          { path: ROUTES.ASSET_DETAIL,  element: appPage(AssetDetailsPage) },
          { path: ROUTES.ALLOCATION,    element: appPage(AllocationPage) },
          { path: ROUTES.BOOKING,       element: appPage(BookingPage) },
          { path: ROUTES.MAINTENANCE,   element: appPage(MaintenancePage) },
          {
            path: ROUTES.AUDIT,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER]}>
                {appPage(AuditPage)}
              </RoleGuard>
            ),
          },
          {
            path: ROUTES.REPORTS,
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPT_HEAD]}>
                {appPage(ReportsPage)}
              </RoleGuard>
            ),
          },
          { path: ROUTES.NOTIFICATIONS, element: appPage(NotificationsPage) },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────
  { path: ROUTES.NOT_FOUND, element: appPage(NotFoundPage) },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
