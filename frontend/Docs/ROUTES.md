# AssetFlow Frontend — Route Map

> **AI INSTRUCTION**: Use this file as the source of truth for all routes.
> Never hardcode route strings — always import from `constants/routes.js`.

---

## Route Overview

| Screen | Path | Component | Protection | Roles |
|--------|------|-----------|------------|-------|
| Login | `/login` | LoginPage | Public only | — |
| Register | `/register` | RegisterPage | Public only | — |
| Forgot Password | `/forgot-password` | ForgotPasswordPage | Public only | — |
| Dashboard | `/` | DashboardPage | Protected | All |
| Org Setup | `/org-setup` | OrgSetupPage | Protected | Admin |
| Assets | `/assets` | AssetsPage | Protected | All |
| Asset Detail | `/assets/:id` | AssetDetailPage | Protected | All |
| Allocation & Transfer | `/allocation` | AllocationPage | Protected | All |
| Resource Booking | `/booking` | BookingPage | Protected | All |
| Maintenance | `/maintenance` | MaintenancePage | Protected | All |
| Audit | `/audit` | AuditPage | Protected | Admin, Asset Manager |
| Reports | `/reports` | ReportsPage | Protected | Admin, Asset Manager, Dept Head |
| Notifications | `/notifications` | NotificationsPage | Protected | All |
| Profile | `/profile` | ProfilePage | Protected | All |
| Settings | `/settings` | SettingsPage | Protected | Admin |
| 404 | `*` | NotFoundPage | — | — |

---

## Route Constants File

`src/constants/routes.js` — single source of truth.

```js
import { ROUTES } from '@/constants/routes'
// Use ROUTES.DASHBOARD, ROUTES.ASSETS, etc.
```

---

## Navigation Guard Strategy

```
PublicRoute
  └── Redirects authenticated users → /dashboard
  └── Children: Login, Register, ForgotPassword

ProtectedRoute
  └── Shows GlobalLoader while isInitializing = true
  └── Redirects unauthenticated → /login (preserves intended URL)
  └── Children: AppLayout → feature pages

RoleGuard
  └── Shows 403 UI for unauthorized roles
  └── Applied on: /org-setup, /audit, /reports
```

---

## Excalidraw Screen → Route Mapping

| Excalidraw Screen | Route |
|---|---|
| Screen 1 — Login | `/login` |
| Screen 2 — Dashboard | `/` |
| Screen 3 — Org Setup (Departments + Categories) | `/org-setup` |
| Screen 4 — Asset Directory | `/assets` |
| Screen 5 — Allocation & Transfer | `/allocation` |
| Screen 6 — Resource Booking (Calendar) | `/booking` |
| Screen 7 — Maintenance Kanban | `/maintenance` |
| Screen 8 — Asset Audit | `/audit` |
| Screen 9 — Reports & Analytics | `/reports` |
| Screen 10 — Activity Logs & Notifications | `/notifications` |
