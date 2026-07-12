import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { Plus, ClipboardCheck, Users, CalendarRange, MapPin, AlertTriangle, Lock } from 'lucide-react'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAudits } from '@/hooks/useAudit'
import { useAuth } from '@/hooks/useAuth'
import CreateAuditModal from './components/CreateAuditModal'
import AuditDetailSheet from './components/AuditDetailSheet'

const STATUS_CONFIG = {
  OPEN:   { label: 'Open',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  CLOSED: { label: 'Closed', className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700' },
}

export default function AuditPage() {
  const { isAdmin, isAssetManager } = useAuth()
  const canManage = isAdmin || isAssetManager

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL') // 'ALL' | 'OPEN' | 'CLOSED'

  const { data: auditsData, isLoading } = useAudits()
  const allAudits = useMemo(
    () => (Array.isArray(auditsData) ? auditsData : (auditsData?.data ?? [])),
    [auditsData]
  )

  const filtered = useMemo(() =>
    filterStatus === 'ALL' ? allAudits : allAudits.filter(a => a.status === filterStatus),
    [allAudits, filterStatus]
  )

  const openCount   = allAudits.filter(a => a.status === 'OPEN').length
  const closedCount = allAudits.filter(a => a.status === 'CLOSED').length

  return (
    <PageWrapper>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Audit Cycles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run physical inventory checks and reconcile asset data.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Audit Cycle
          </Button>
        )}
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', count: allAudits.length, key: 'ALL', color: 'bg-card border-border' },
          { label: 'Open',  count: openCount,         key: 'OPEN',   color: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300' },
          { label: 'Closed',count: closedCount,       key: 'CLOSED', color: 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700' },
        ].map(({ label, count, key, color }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? 'ALL' : key)}
            className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${color} ${filterStatus === key ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
          >
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs mt-0.5 opacity-70">{label}</p>
          </button>
        ))}
      </div>

      {/* ── Cycle cards grid ────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <ClipboardCheck size={28} className="opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">No audit cycles found</p>
            <p className="text-xs mt-0.5">
              {canManage ? 'Click "Create Audit Cycle" to get started.' : 'No cycles have been created yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cycle => {
            const cfg = STATUS_CONFIG[cycle.status] ?? STATUS_CONFIG.OPEN
            const isClosed = cycle.status === 'CLOSED'
            const isOverdue = !isClosed && dayjs(cycle.endDate).isBefore(dayjs(), 'day')

            return (
              <button
                key={cycle.id}
                onClick={() => setSelectedCycle(cycle)}
                className="group text-left rounded-xl border bg-card p-5 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
              >
                {/* Status + overdue badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
                      <AlertTriangle size={10} /> Overdue
                    </span>
                  )}
                  {isClosed && <Lock size={12} className="text-muted-foreground ml-auto" />}
                </div>

                {/* Name */}
                <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cycle.name}
                </h3>

                {/* Date range */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <CalendarRange size={11} />
                  {dayjs(cycle.startDate).format('MMM D')} – {dayjs(cycle.endDate).format('MMM D, YYYY')}
                </div>

                {/* Scope + auditors */}
                <div className="space-y-1.5 border-t pt-3 mt-auto">
                  {cycle.scopeLocation && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <MapPin size={11} className="flex-shrink-0" /> {cycle.scopeLocation}
                    </p>
                  )}
                  {cycle.auditors?.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Users size={11} className="flex-shrink-0" />
                      {cycle.auditors.map(a => a.name).join(', ')}
                    </p>
                  )}
                  {cycle._count && (
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {cycle._count.auditItems} asset{cycle._count.auditItems !== 1 ? 's' : ''} scanned
                    </p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      {canManage && (
        <CreateAuditModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      )}

      {selectedCycle && (
        <AuditDetailSheet
          cycle={selectedCycle}
          isAdmin={canManage}
          onClose={() => setSelectedCycle(null)}
        />
      )}
    </PageWrapper>
  )
}
