// utils/formatters.js
// Shared formatting utilities using DayJS.
// Always import from here — never format inline in components.

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.extend(relativeTime)
dayjs.extend(duration)

// ── Date & Time ──────────────────────────────────────────────

/**
 * Format date as "Jan 12, 2025"
 */
export function formatDate(date) {
  if (!date) return '—'
  return dayjs(date).format('MMM D, YYYY')
}

/**
 * Format date as "Jan 12, 2025 at 3:30 PM"
 */
export function formatDateTime(date) {
  if (!date) return '—'
  return dayjs(date).format('MMM D, YYYY [at] h:mm A')
}

/**
 * Format date as relative time — "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date) {
  if (!date) return '—'
  return dayjs(date).fromNow()
}

/**
 * Format date for display in tables — "12 Jul 2025"
 */
export function formatTableDate(date) {
  if (!date) return '—'
  return dayjs(date).format('D MMM YYYY')
}

/**
 * Format as ISO 8601 for API payloads
 */
export function toISOString(date) {
  if (!date) return null
  return dayjs(date).toISOString()
}

// ── Numbers & Currency ───────────────────────────────────────

/**
 * Format as Indian Rupee currency — ₹1,23,456.00
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number with thousands separator — 1,23,456
 */
export function formatNumber(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN').format(value)
}

/**
 * Format as compact number — 1.2K, 3.4M
 */
export function formatCompact(value) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value)
}

// ── Strings ──────────────────────────────────────────────────

/**
 * Truncate text to a max length, appending ellipsis
 */
export function truncate(text, maxLength = 40) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Convert snake_case or SCREAMING_SNAKE to Title Case
 */
export function formatEnum(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Get initials from a full name — "Priya Shah" → "PS"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}
