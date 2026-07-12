// layouts/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
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
  ChevronsUpDown,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { selectUnreadCount } from '@/redux/slices/notificationSlice'
import { useAuth } from '@/hooks/useAuth'
import { getInitials } from '@/utils/formatters'

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'

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

export default function Sidebar() {
  const unreadCount = useSelector(selectUnreadCount)
  const { user, role, logout } = useAuth()
  const { isMobile, state } = useSidebar()
  const location = useLocation()

  const filteredGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((group) => group.items.length > 0)

  return (
    <ShadcnSidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border flex items-center justify-center py-4 h-[var(--header-h)] relative z-20">
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-6 h-6 rounded-[4px] bg-[var(--sidebar-active-pip,theme(colors.blue.600))] flex items-center justify-center flex-shrink-0 shadow-sm"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.9"/>
              <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.6"/>
              <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.6"/>
              <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
            </svg>
          </motion.div>
          {state !== "collapsed" && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-semibold text-sidebar-foreground truncate tracking-tight"
            >
              AssetFlow
            </motion.span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {filteredGroups.map((group, gi) => (
          <SidebarGroup key={gi} className="px-3">
            {group.label && <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.path === ROUTES.DASHBOARD
                      ? location.pathname === item.path
                      : location.pathname.startsWith(item.path)
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        render={<NavLink to={item.path} />}
                        className={cn(
                          "relative group transition-colors overflow-hidden isolate",
                          isActive 
                            ? "text-[var(--sidebar-active-pip,theme(colors.blue.600))] font-medium bg-transparent hover:bg-transparent" 
                            : "text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        {isActive && (
                          <>
                            <motion.div
                              layoutId="active-nav-pill"
                              className="absolute inset-0 rounded-md pointer-events-none -z-10"
                              style={{ backgroundColor: 'var(--sidebar-active-pip, theme(colors.blue.600))', opacity: 0.12 }}
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                            <motion.div
                              layoutId="active-nav-pip"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--sidebar-active-pip,theme(colors.blue.600))] rounded-r-full pointer-events-none -z-10"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          </>
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: isActive ? 0 : 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center shrink-0"
                        >
                          <item.icon className="size-4" />
                        </motion.div>
                        <span className="truncate">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <div className="mx-4 my-2 h-px bg-sidebar-border opacity-50" />

        <SidebarGroup className="px-3">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Notifications"
                  render={<NavLink to={ROUTES.NOTIFICATIONS} />}
                  className={cn(
                    "relative group transition-colors overflow-hidden isolate",
                    location.pathname.startsWith(ROUTES.NOTIFICATIONS)
                      ? "text-[var(--sidebar-active-pip,theme(colors.blue.600))] font-medium bg-transparent hover:bg-transparent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {location.pathname.startsWith(ROUTES.NOTIFICATIONS) && (
                    <>
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 rounded-md pointer-events-none -z-10"
                        style={{ backgroundColor: 'var(--sidebar-active-pip, theme(colors.blue.600))', opacity: 0.12 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                      <motion.div
                        layoutId="active-nav-pip"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[var(--sidebar-active-pip,theme(colors.blue.600))] rounded-r-full pointer-events-none -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    </>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center shrink-0"
                  >
                    <Bell className="size-4" />
                  </motion.div>
                  <span className="truncate">Notifications</span>
                  {unreadCount > 0 && (
                    <SidebarMenuBadge className="bg-[var(--sidebar-active-pip,theme(colors.blue.600))] text-white px-1.5 py-0.5 rounded text-[10px] h-auto min-w-[18px]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group hover:bg-sidebar-accent transition-colors flex items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'w-8 h-8 rounded-md bg-[var(--sidebar-active-pip,theme(colors.blue.600))] shrink-0',
                      'flex items-center justify-center shadow-sm',
                      'text-xs font-semibold text-white leading-none',
                    )}
                  >
                    {user ? getInitials(user.name) : '?'}
                  </motion.div>
                  <div className="grid flex-1 text-left text-sm leading-tight transition-opacity">
                    <span className="truncate font-medium">{user?.name ?? 'User'}</span>
                    <span className="truncate text-xs capitalize text-muted-foreground group-hover:text-foreground transition-colors">{user?.role?.replace(/_/g, ' ')}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="start" className="w-56" sideOffset={4}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-md bg-[var(--sidebar-active-pip,theme(colors.blue.600))] shrink-0',
                          'flex items-center justify-center shadow-sm',
                          'text-xs font-semibold text-white leading-none',
                        )}
                      >
                        {user ? getInitials(user.name) : '?'}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{user?.name ?? 'User'}</span>
                        <span className="truncate text-xs capitalize text-muted-foreground">{user?.role?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
