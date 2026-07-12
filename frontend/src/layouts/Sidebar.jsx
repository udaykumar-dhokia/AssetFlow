// layouts/Sidebar.jsx
// Navigation sidebar — premium dark neutral shell.
// Design reference: Linear, Notion, Vercel Dashboard.
// Rules:
//   - Active state = subtle white tint + left pip (accent color)
//   - Hover = barely-visible white overlay
//   - Text is muted by default, legible on hover/active
//   - No indigo fills, no rounded pill backgrounds

import { NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarCheck,
  Wrench,
  ClipboardList,
  BarChart2,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { toggleSidebar, selectIsSidebarCollapsed } from '@/redux/slices/sidebarSlice'
import { selectUnreadCount } from '@/redux/slices/notificationSlice'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/utils/formatters'

// ── Navigation items ──────────────────────────────────────────
const NAV_GROUPS = [
  {
    items: [
      { label: 'Dashboard',            icon: LayoutDashboard, path: ROUTES.DASHBOARD,     roles: null },
      { label: 'Org Setup',            icon: Building2,       path: ROUTES.ORG_SETUP,     roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Assets',               icon: Package,         path: ROUTES.ASSETS,        roles: null },
      { label: 'Allocation & Transfer',icon: ArrowLeftRight,  path: ROUTES.ALLOCATION,    roles: null },
      { label: 'Resource Booking',     icon: CalendarCheck,   path: ROUTES.BOOKING,       roles: null },
      { label: 'Maintenance',          icon: Wrench,          path: ROUTES.MAINTENANCE,   roles: null },
    ],
  },
  {
    label: 'Governance',
    items: [
      { label: 'Audit',                icon: ClipboardList,   path: ROUTES.AUDIT,         roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER] },
      { label: 'Reports',              icon: BarChart2,       path: ROUTES.REPORTS,       roles: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD] },
    ],
  },
]

// ── Single nav item ───────────────────────────────────────────
function NavItem({ item, isCollapsed, unreadCount }) {
  const location = useLocation()
  const isActive =
    item.path === ROUTES.DASHBOARD
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)

  const Icon  = item.icon
  const badge = item.path === ROUTES.NOTIFICATIONS ? unreadCount : 0

  return (
    <NavLink
      to={item.path}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[4px]',
        'text-[13px] font-medium transition-colors duration-100',
        'select-none',
        isCollapsed ? 'justify-center px-0 py-2 mx-1' : 'px-2.5 py-[7px] mx-1.5',
        isActive
          ? 'bg-[var(--sidebar-item-active)] text-[var(--sidebar-text-active)]'
          : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--sidebar-text-hover)]',
      )}
    >
      {/* Active left pip */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full bg-[var(--sidebar-active-pip)]" />
      )}

      <Icon
        size={15}
        strokeWidth={isActive ? 2 : 1.75}
        className={cn(
          'flex-shrink-0 transition-colors duration-100',
          isActive
            ? 'text-[var(--sidebar-icon-active)]'
            : 'text-[var(--sidebar-icon)] group-hover:text-[var(--sidebar-icon-hover)]',
        )}
      />

      {!isCollapsed && (
        <>
          <span className="truncate flex-1">{item.label}</span>

          {badge > 0 && (
            <span className="ml-auto flex-shrink-0 h-4 min-w-4 px-1 rounded-sm bg-[var(--sidebar-active-pip)] text-white text-[10px] font-semibold leading-4 flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}

      {/* Badge dot in collapsed mode */}
      {isCollapsed && badge > 0 && (
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--sidebar-active-pip)]" />
      )}
    </NavLink>
  )
}

// ── Group label ───────────────────────────────────────────────
function GroupLabel({ label, isCollapsed }) {
  if (isCollapsed) return <div className="h-px mx-3 my-1 bg-[var(--sidebar-border)]" />
  return (
    <span className={cn(
      'block px-4 pt-3 pb-1',
      'text-[10px] font-semibold uppercase tracking-widest',
      'text-[var(--sidebar-icon)] select-none',
    )}>
      {label}
    </span>
  )
}

// ── Sidebar ────────────────────────────────────────────────────
export default function Sidebar() {
  const dispatch    = useDispatch()
  const isCollapsed = useSelector(selectIsSidebarCollapsed)
  const unreadCount = useSelector(selectUnreadCount)
  const { user, role, logout } = useAuth()

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      style={{ width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      className={cn(
        'flex flex-col flex-shrink-0 h-screen sticky top-0',
        'bg-[var(--bg-sidebar)] border-r border-[var(--sidebar-border)]',
        'transition-[width] duration-200 ease-in-out overflow-hidden',
      )}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center flex-shrink-0 h-[var(--header-height)]',
          'border-b border-[var(--sidebar-border)]',
          isCollapsed ? 'justify-center px-0' : 'gap-2 px-4',
        )}
      >
        {/* Logo mark — a flat geometric mark, no gradient */}
        <div className="w-6 h-6 rounded-[4px] bg-[var(--sidebar-active-pip)] flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.9"/>
            <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.6"/>
            <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.6"/>
            <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
          </svg>
        </div>

        {!isCollapsed && (
          <span className="text-white font-semibold text-[14px] tracking-[-0.01em]">
            AssetFlow
          </span>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0">
        {filteredGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <GroupLabel label={group.label} isCollapsed={isCollapsed} />
            )}
            <div className="space-y-[1px]">
              {group.items.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  isCollapsed={isCollapsed}
                  unreadCount={unreadCount}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="mx-3 my-2 h-px bg-[var(--sidebar-border)]" />

        {/* Notifications */}
        <div className="space-y-[1px]">
          <NavItem
            item={{ label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS }}
            isCollapsed={isCollapsed}
            unreadCount={unreadCount}
          />
        </div>
      </nav>

      {/* ── User + Collapse ────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-[var(--sidebar-border)]">
        {/* User row */}
        <div
          className={cn(
            'flex items-center gap-2.5 px-3 py-2.5',
            isCollapsed && 'justify-center px-0 py-3',
          )}
        >
          {/* Avatar — flat, no gradient */}
          <div
            title={user?.name}
            className={cn(
              'w-6 h-6 rounded-[4px] bg-[var(--sidebar-active-pip)] flex-shrink-0',
              'flex items-center justify-center',
              'text-[10px] font-semibold text-white leading-none',
            )}
          >
            {user ? getInitials(user.name) : '?'}
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[var(--sidebar-text-hover)] truncate leading-tight">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[11px] text-[var(--sidebar-icon)] truncate leading-tight capitalize">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className={cn(
                  'p-1 rounded-[3px] flex-shrink-0 transition-colors',
                  'text-[var(--sidebar-icon)] hover:text-[var(--sidebar-text-hover)]',
                  'hover:bg-[var(--sidebar-item-hover)]',
                )}
              >
                <LogOut size={13} strokeWidth={1.75} />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'w-full flex items-center gap-2 py-2 transition-colors',
            'text-[11px] text-[var(--sidebar-icon)] hover:text-[var(--sidebar-text-hover)]',
            'hover:bg-[var(--sidebar-item-hover)]',
            'border-t border-[var(--sidebar-border)]',
            isCollapsed ? 'justify-center px-0' : 'px-3',
          )}
        >
          {isCollapsed
            ? <PanelLeftOpen size={13} strokeWidth={1.75} />
            : (
              <>
                <PanelLeftClose size={13} strokeWidth={1.75} />
                <span>Collapse</span>
              </>
            )
          }
        </button>
      </div>
    </aside>
  )
}
