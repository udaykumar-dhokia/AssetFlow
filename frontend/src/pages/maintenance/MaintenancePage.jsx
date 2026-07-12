import { useState, useMemo } from 'react'
import { Plus, MoreHorizontal, Eye, AlertTriangle } from 'lucide-react'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMaintenanceRequests } from '@/hooks/useMaintenance'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import RaiseRequestModal from './components/RaiseRequestModal'
import MaintenanceDetailSheet from './components/MaintenanceDetailSheet'

// ── Config maps ───────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:       { label: 'Pending',       className: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300' },
  APPROVED:      { label: 'Approved',      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
  REJECTED:      { label: 'Rejected',      className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400' },
  TECH_ASSIGNED: { label: 'Tech Assigned', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300' },
  IN_PROGRESS:   { label: 'In Progress',   className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300' },
  RESOLVED:      { label: 'Resolved',      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300' },
}

const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400' },
  MEDIUM:   { label: 'Medium',   className: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400' },
  HIGH:     { label: 'High',     className: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400' },
  CRITICAL: { label: 'Critical', className: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
}

const ALL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'TECH_ASSIGNED', 'IN_PROGRESS', 'RESOLVED']

export default function MaintenancePage() {
  const { isAdmin, isAssetManager } = useAuth()
  const canManage = isAdmin || isAssetManager

  const [isRaiseOpen, setIsRaiseOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [globalFilter, setGlobalFilter] = useState('')

  const { data: requestsData, isLoading } = useMaintenanceRequests()

  // The API returns an array directly
  const allRequests = useMemo(
    () => (Array.isArray(requestsData) ? requestsData : (requestsData?.data ?? [])),
    [requestsData]
  )

  // Client-side status filter (list is already scoped by role server-side)
  const filtered = useMemo(() =>
    statusFilter === 'ALL'
      ? allRequests
      : allRequests.filter(r => r.status === statusFilter),
    [allRequests, statusFilter]
  )

  const columns = useMemo(() => [
    {
      accessorKey: 'asset.name',
      id: 'asset',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset" />,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-foreground">{row.original.asset?.name ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.original.asset?.assetTag}</p>
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const p = row.getValue('priority')
        const cfg = PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG.LOW
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const s = row.getValue('status')
        const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.PENDING
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      accessorKey: 'issueDescription',
      header: 'Issue',
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground truncate max-w-[240px]">
          {row.getValue('issueDescription')}
        </p>
      ),
    },
    {
      accessorKey: 'requestedBy.name',
      id: 'requestedBy',
      header: 'Raised By',
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">{row.original.requestedBy?.name ?? '—'}</p>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground">
          {format(new Date(row.getValue('createdAt')), 'MMM d, yyyy')}
        </p>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedId(row.original.id)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  return (
    <PageWrapper>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {canManage
              ? 'Manage and track all asset maintenance requests across the organisation.'
              : 'View and raise maintenance requests for your allocated assets.'}
          </p>
        </div>
        <Button
          onClick={() => setIsRaiseOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 dark:shadow-none transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Raise Request
        </Button>
      </div>

      {/* ── Stats strip (admin/manager only) ────────────────── */}
      {canManage && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {ALL_STATUSES.map(s => {
            const count = allRequests.filter(r => r.status === s).length
            const cfg = STATUS_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
                className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${
                  statusFilter === s ? cfg.className + ' ring-2 ring-current/20' : 'bg-card border-border'
                }`}
              >
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs mt-0.5 opacity-70">{cfg.label}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Table Card ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 md:p-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="w-full sm:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue>
                  {statusFilter === 'ALL' ? 'All Statuses' : (STATUS_CONFIG[statusFilter]?.label ?? statusFilter)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {ALL_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable
          isLoading={isLoading}
          columns={columns}
          data={filtered}
          searchPlaceholder="Search by asset, issue, or requester…"
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
        />
      </div>

      {/* ── Modals & Sheets ─────────────────────────────────── */}
      <RaiseRequestModal open={isRaiseOpen} onOpenChange={setIsRaiseOpen} />

      {selectedId && (
        <MaintenanceDetailSheet
          requestId={selectedId}
          isAdmin={canManage}
          onClose={() => setSelectedId(null)}
        />
      )}
    </PageWrapper>
  )
}
