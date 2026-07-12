// constants/queryKeys.js
// TanStack Query key factory.
// Centralises cache key definitions for consistency and easy invalidation.

export const QUERY_KEYS = {
  // ── Auth ──────────────────────────────────────────────────
  ME:               ['me'],

  // ── Organization ──────────────────────────────────────────
  DEPARTMENTS:      ['departments'],
  DEPARTMENT:       (id) => ['departments', id],
  CATEGORIES:       ['categories'],
  CATEGORY:         (id) => ['categories', id],
  EMPLOYEES:        ['employees'],
  EMPLOYEE:         (id) => ['employees', id],

  // ── Assets ────────────────────────────────────────────────
  ASSETS:           ['assets'],
  ASSET:            (id) => ['assets', id],
  ASSET_HISTORY:    (id) => ['assets', id, 'history'],

  // ── Allocation ────────────────────────────────────────────
  ALLOCATIONS:      ['allocations'],
  ALLOCATION:       (id) => ['allocations', id],
  TRANSFERS:        ['transfers'],
  TRANSFER:         (id) => ['transfers', id],

  // ── Booking ───────────────────────────────────────────────
  BOOKINGS:         ['bookings'],
  BOOKING:          (id) => ['bookings', id],

  // ── Maintenance ───────────────────────────────────────────
  MAINTENANCE_LIST: ['maintenance'],
  MAINTENANCE_ITEM: (id) => ['maintenance', id],

  // ── Audit ─────────────────────────────────────────────────
  AUDITS:           ['audits'],
  AUDIT:            (id) => ['audits', id],

  // ── Reports ───────────────────────────────────────────────
  REPORTS:          ['reports'],
  REPORT:           (type) => ['reports', type],

  // ── Notifications ─────────────────────────────────────────
  NOTIFICATIONS:    ['notifications'],
}
