// constants/routes.js
// Central route path definitions.
// ALWAYS import route strings from here — never hardcode.

export const ROUTES = {
  // ── Auth ──────────────────────────────────────────────────
  LOGIN:            '/login',
  REGISTER:         '/register',
  FORGOT_PASSWORD:  '/forgot-password',
  RESET_PASSWORD:   '/reset-password',

  // ── App (protected) ───────────────────────────────────────
  DASHBOARD:        '/',
  ORG_SETUP:        '/org-setup',
  EMPLOYEES:        '/employees',

  // ── Assets ────────────────────────────────────────────────
  ASSETS:           '/assets',
  ASSET_DETAIL:     '/assets/:id',

  // ── Allocation & Transfers ────────────────────────────────
  ALLOCATION:       '/allocation',

  // ── Resource Booking ──────────────────────────────────────
  BOOKING:          '/booking',

  // ── Maintenance ───────────────────────────────────────────
  MAINTENANCE:      '/maintenance',

  // ── Audit ─────────────────────────────────────────────────
  AUDIT:            '/audit',

  // ── Reports ───────────────────────────────────────────────
  REPORTS:          '/reports',

  // ── Notifications ─────────────────────────────────────────
  NOTIFICATIONS:    '/notifications',

  // ── Profile & Settings ────────────────────────────────────
  PROFILE:          '/profile',
  SETTINGS:         '/settings',

  // ── Fallback ──────────────────────────────────────────────
  NOT_FOUND:        '*',
}
