// layouts/Header.jsx
// Top application header — clean, white, Stripe-style.
// Rules:
//   - White background, 1px bottom border only
//   - No box shadows
//   - Search bar is minimal, keyboard-shortcut driven
//   - Notifications via icon + count badge
//   - Compact 48px height

import { useSelector } from 'react-redux'
import { Bell, Search, Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { selectUnreadCount } from '@/redux/slices/notificationSlice'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { getInitials } from '@/utils/formatters'

export default function Header({ title = '' }) {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const unreadCount   = useSelector(selectUnreadCount)

  return (
    <header className="app-header">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1
            className="text-[14px] font-semibold tracking-[-0.01em] truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Search — minimal trigger, Stripe-style */}
        <button
          className={cn(
            'hidden md:flex items-center gap-2 h-7 px-2.5',
            'rounded-[5px] border border-[var(--border-default)]',
            'text-[12px] text-[var(--text-tertiary)]',
            'bg-[var(--bg-subtle)] hover:bg-[var(--bg-canvas)]',
            'hover:border-[var(--border-strong)]',
            'transition-colors duration-100',
            'mr-2 w-40',
          )}
          title="Search (⌘K)"
        >
          <Search size={12} strokeWidth={1.75} />
          <span className="flex-1 text-left">Search...</span>
          <kbd>⌘K</kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className={cn(
            'h-7 w-7 flex items-center justify-center rounded-[5px]',
            'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-subtle)]',
            'transition-colors duration-100',
          )}
        >
          {isDark
            ? <Sun size={14} strokeWidth={1.75} />
            : <Moon size={14} strokeWidth={1.75} />
          }
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          title="Notifications"
          className={cn(
            'relative h-7 w-7 flex items-center justify-center rounded-[5px]',
            'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-subtle)]',
            'transition-colors duration-100',
          )}
        >
          <Bell size={14} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute top-1 right-1',
                'w-3.5 h-3.5 rounded-full',
                'bg-[var(--color-accent-500)] text-white',
                'text-[9px] font-semibold leading-none',
                'flex items-center justify-center',
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar — flat, no gradient */}
        <button
          title={user?.name ?? 'Profile'}
          className={cn(
            'ml-1.5 h-6 w-6 rounded-[4px] flex-shrink-0',
            'flex items-center justify-center',
            'text-[10px] font-semibold text-white leading-none',
            'bg-[var(--color-zinc-800)] dark:bg-[var(--color-zinc-700)]',
            'hover:opacity-80 transition-opacity',
          )}
        >
          {user ? getInitials(user.name) : '?'}
        </button>
      </div>
    </header>
  )
}
