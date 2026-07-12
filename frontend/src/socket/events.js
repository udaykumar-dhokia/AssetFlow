// socket/events.js
// Socket.IO event name constants.
// Always use these constants — never hardcode event strings.

export const SOCKET_EVENTS = {
  // ── Connection ────────────────────────────────────────────
  CONNECT:      'connect',
  DISCONNECT:   'disconnect',
  CONNECT_ERROR:'connect_error',

  // ── Notifications ─────────────────────────────────────────
  NOTIFICATION_NEW:     'notification:new',
  NOTIFICATION_READ:    'notification:read',
  NOTIFICATION_ALL_READ:'notification:all_read',

  // ── Dashboard Live Updates ─────────────────────────────────
  DASHBOARD_STATS:      'dashboard:stats',
  ASSET_STATUS_CHANGED: 'asset:status_changed',

  // ── Maintenance ───────────────────────────────────────────
  MAINTENANCE_UPDATED:  'maintenance:updated',

  // ── Bookings ──────────────────────────────────────────────
  BOOKING_CONFIRMED:    'booking:confirmed',
  BOOKING_CANCELLED:    'booking:cancelled',

  // ── Transfers ─────────────────────────────────────────────
  TRANSFER_APPROVED:    'transfer:approved',
  TRANSFER_REJECTED:    'transfer:rejected',

  // ── Audit ─────────────────────────────────────────────────
  AUDIT_FLAGGED:        'audit:flagged',
}
