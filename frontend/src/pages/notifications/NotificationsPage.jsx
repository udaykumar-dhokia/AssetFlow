import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  Bell, BellOff, CheckCheck, Activity, Filter, RefreshCw,
  Package, Wrench, Calendar, UserCheck, ArrowLeftRight,
  RotateCcw, Trash2, FolderCog, User, AlertTriangle, Info,
} from 'lucide-react'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useNotifications, useMarkAsRead, useMarkAllRead, useActivityLogs } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

dayjs.extend(relativeTime)

// ── Notification type config ──────────────────────────────────
const NOTIF_CONFIG = {
  ASSET_ALLOCATED:     { icon: <Package size={14} />,       color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  ASSET_RETURNED:      { icon: <RotateCcw size={14} />,     color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  TRANSFER_REQUESTED:  { icon: <ArrowLeftRight size={14} />,color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400' },
  TRANSFER_APPROVED:   { icon: <UserCheck size={14} />,     color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  MAINTENANCE_CREATED: { icon: <Wrench size={14} />,        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' },
  MAINTENANCE_APPROVED:{ icon: <Wrench size={14} />,        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  MAINTENANCE_REJECTED:{ icon: <Wrench size={14} />,        color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  MAINTENANCE_RESOLVED:{ icon: <Wrench size={14} />,        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  BOOKING_CREATED:     { icon: <Calendar size={14} />,      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' },
  BOOKING_CANCELLED:   { icon: <Calendar size={14} />,      color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  BOOKING_UPDATED:     { icon: <Calendar size={14} />,      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' },
  DEFAULT:             { icon: <Info size={14} />,           color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
}

// ── Activity log action → icon ────────────────────────────────
function activityIcon(action = '') {
  if (action.includes('ASSET'))        return <Package size={13} className="text-blue-500" />
  if (action.includes('MAINTENANCE'))  return <Wrench size={13} className="text-orange-500" />
  if (action.includes('BOOKING'))      return <Calendar size={13} className="text-indigo-500" />
  if (action.includes('DEPARTMENT') || action.includes('CATEGORY')) return <FolderCog size={13} className="text-violet-500" />
  if (action.includes('EMPLOYEE'))     return <User size={13} className="text-emerald-500" />
  if (action.includes('TRANSFER'))     return <ArrowLeftRight size={13} className="text-cyan-500" />
  return <Activity size={13} className="text-muted-foreground" />
}

const ENTITY_TYPES = ['', 'User', 'Asset', 'AssetAllocation', 'MaintenanceRequest', 'Booking', 'Department', 'Category']

const ACTION_GROUPS = [
  '',
  'ASSET_CREATED', 'ASSET_ALLOCATED', 'ASSET_RETURNED',
  'TRANSFER_REQUESTED', 'TRANSFER_APPROVED',
  'MAINTENANCE_CREATED', 'MAINTENANCE_APPROVED', 'MAINTENANCE_REJECTED', 'MAINTENANCE_RESOLVED',
  'BOOKING_CREATED', 'BOOKING_CANCELLED', 'BOOKING_UPDATED',
  'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED',
  'CATEGORY_CREATED', 'CATEGORY_DELETED',
  'EMPLOYEE_UPDATED',
]

// ─────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { isAdmin, isAssetManager } = useAuth()
  const canViewLogs = isAdmin || isAssetManager

  const [activeTab, setActiveTab] = useState('notifications') // 'notifications' | 'activity'
  const [unreadOnly, setUnreadOnly] = useState(false)

  // Activity log filters
  const [actionFilter, setActionFilter]     = useState('')
  const [entityFilter, setEntityFilter]     = useState('')
  const [userSearch, setUserSearch]         = useState('')

  // ── Notifications data ──────────────────────────────────────
  const { data: notifications = [], isLoading: isLoadingNotifs, refetch: refetchNotifs } =
    useNotifications({ unreadOnly: unreadOnly || undefined })

  const { mutate: markRead,  isPending: isMarking }    = useMarkAsRead()
  const { mutate: markAll,   isPending: isMarkingAll } = useMarkAllRead()

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  // ── Activity log data ───────────────────────────────────────
  const activityParams = useMemo(() => ({
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(entityFilter ? { entityType: entityFilter } : {}),
  }), [actionFilter, entityFilter])

  const { data: activityLogs = [], isLoading: isLoadingLogs, refetch: refetchLogs } =
    useActivityLogs(activityParams)

  // Client-side user search on logs
  const filteredLogs = useMemo(() => {
    if (!userSearch.trim()) return activityLogs
    const q = userSearch.toLowerCase()
    return activityLogs.filter(l =>
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.email?.toLowerCase().includes(q)
    )
  }, [activityLogs, userSearch])

  // ── Helpers ─────────────────────────────────────────────────
  const getNotifConfig = (type) => NOTIF_CONFIG[type] ?? NOTIF_CONFIG.DEFAULT

  return (
    <PageWrapper>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on asset activities and system events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => activeTab === 'notifications' ? refetchNotifs() : refetchLogs()}
          className="gap-1.5"
        >
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      {/* ── Tab switcher ────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-6 w-fit">
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          icon={<Bell size={14} />}
          label="Notifications"
          badge={unreadCount > 0 ? unreadCount : null}
        />
        {canViewLogs && (
          <TabButton
            active={activeTab === 'activity'}
            onClick={() => setActiveTab('activity')}
            icon={<Activity size={14} />}
            label="Activity Log"
          />
        )}
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB 1 — Notifications
          ════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                  unreadOnly
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-border text-muted-foreground hover:border-indigo-300 hover:text-indigo-600'
                )}
              >
                <Filter size={11} />
                {unreadOnly ? 'Unread Only' : 'All'}
              </button>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => markAll()}
                disabled={isMarkingAll}
                className="gap-1.5 text-xs h-8"
              >
                <CheckCheck size={13} />
                {isMarkingAll ? 'Marking…' : 'Mark all as read'}
              </Button>
            )}
          </div>

          {/* Notification list */}
          {isLoadingNotifs ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-5">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-3 w-72" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <BellOff size={26} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-0.5">
                  {unreadOnly ? 'No unread notifications.' : 'No notifications yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => {
                const cfg = getNotifConfig(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.isRead && markRead(notif.id)}
                    className={cn(
                      'flex items-start gap-4 px-5 py-4 transition-colors',
                      !notif.isRead
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/20 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', cfg.color)}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium leading-tight', !notif.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">
                        {dayjs(notif.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB 2 — Activity Log (Admin / Asset Manager only)
          ════════════════════════════════════════════════════════ */}
      {activeTab === 'activity' && canViewLogs && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Filter toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b flex-wrap">
            <Input
              placeholder="Search by user name or email…"
              className="h-8 text-sm sm:w-56"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 text-xs sm:w-52">
                <SelectValue>
                  {actionFilter || 'All Actions'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ACTION_GROUPS.map(a => (
                  <SelectItem key={a || '__all__'} value={a}>{a || 'All Actions'}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="h-8 text-xs sm:w-44">
                <SelectValue>
                  {entityFilter || 'All Entity Types'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map(e => (
                  <SelectItem key={e || '__all__'} value={e}>{e || 'All Entity Types'}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(actionFilter || entityFilter || userSearch) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground"
                onClick={() => { setActionFilter(''); setEntityFilter(''); setUserSearch('') }}
              >
                <Trash2 size={11} /> Clear filters
              </Button>
            )}

            <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Log list */}
          {isLoadingLogs ? (
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-5">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-2.5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Activity size={26} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No activity logs found</p>
                <p className="text-xs mt-0.5">Try clearing or adjusting your filters.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
                  {/* Action icon */}
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {activityIcon(log.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-foreground font-mono tracking-tight">
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                          {log.entityType}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground/70 flex-shrink-0">
                        {dayjs(log.createdAt).fromNow()}
                      </span>
                    </div>

                    {/* User */}
                    {log.user && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by <span className="font-medium text-foreground">{log.user.name}</span>
                        {' '}·{' '}{log.user.email}
                      </p>
                    )}

                    {/* Data diff — show only changed fields in a clean table */}
                    {log.details && (log.details.old_data || log.details.new_data) && (
                      <DataDiff old={log.details.old_data} next={log.details.new_data} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  )
}

// ── Shared tab button ─────────────────────────────────────────
function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
      {badge != null && (
        <span className="ml-0.5 min-w-4 h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

// ── Data diff — shows only changed keys, human-readable ───────
function DataDiff({ old: oldData, next: newData }) {
  const old_ = oldData ?? {}
  const new_ = newData ?? {}

  // Collect all keys from both objects
  const allKeys = Array.from(new Set([...Object.keys(old_), ...Object.keys(new_)]))

  // Only show keys that actually changed or are new
  const changedKeys = allKeys.filter(k => {
    // Ignore large nested objects or arrays if they haven't actually changed their identity
    // For a deeper comparison we could use lodash, but for UI stringify is a quick proxy
    const o = JSON.stringify(old_[k] ?? null)
    const n = JSON.stringify(new_[k] ?? null)
    return o !== n
  })

  if (changedKeys.length === 0) return null

  const fmt = (val) => {
    if (val === null || val === undefined) return <span className="italic opacity-50">—</span>
    if (typeof val === 'boolean') return val ? 'true' : 'false'
    if (typeof val === 'object') {
      if (Array.isArray(val)) return val.length ? val.join(', ') : 'Empty list'
      // Try to extract a human-readable property from the nested object
      const label = val.name || val.title || val.assetTag || val.label || val.email
      if (label) return String(label)
      // Fallback if no readable property exists
      if (val.id) return `ID: ${val.id.slice(0, 8)}...`
      return 'Updated'
    }
    return String(val)
  }

  const fmtKey = (k) =>
    k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim()

  return (
    <div className="mt-2 rounded-md border border-border overflow-hidden text-xs">
      <div className="grid grid-cols-[auto_1fr_1fr] divide-x divide-border">
        {/* Header */}
        <div className="px-2 py-1 bg-muted text-muted-foreground font-medium">Field</div>
        <div className="px-2 py-1 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium">Before</div>
        <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-medium">After</div>

        {/* Rows */}
        {changedKeys.map(k => (
          <React.Fragment key={k}>
            <div className="px-2 py-1.5 bg-muted/40 text-muted-foreground font-medium border-t border-border">
              {fmtKey(k)}
            </div>
            <div className="px-2 py-1.5 bg-red-50/60 dark:bg-red-950/10 text-red-700 dark:text-red-300 border-t border-border truncate max-w-[200px]" title={String(fmt(old_[k]))}>
              {fmt(old_[k])}
            </div>
            <div className="px-2 py-1.5 bg-emerald-50/60 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-300 border-t border-border truncate max-w-[200px]" title={String(fmt(new_[k]))}>
              {fmt(new_[k])}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

