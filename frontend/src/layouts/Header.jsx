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

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export default function Header({ title = '' }) {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const unreadCount   = useSelector(selectUnreadCount)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 w-full bg-background">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
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
      {/* add darkmode and notification option  */}
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
    </header>
  )
}
