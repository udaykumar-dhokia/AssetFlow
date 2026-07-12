// pages/reports/ReportsPage.jsx
// Reports & Analytics dashboard — Utilization, Maintenance, Department, Heatmap tabs.
// Route-guarded to: ADMIN, ASSET_MANAGER, DEPT_HEAD

import { useState } from 'react'
import { BarChart3, Download, RefreshCw, TrendingUp, Wrench, Building2, CalendarDays, ChevronDown } from 'lucide-react'
import PageWrapper from '@/layouts/PageWrapper'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReusableTabs } from '@/components/ui/reusable-tabs'
import { useAuth } from '@/hooks/useAuth'
import {
  useUtilizationReport,
  useMaintenanceReport,
  useDepartmentSummary,
  useBookingHeatmap,
  useExportReport,
} from '@/hooks/useReports'

// ── Sub-panels ─────────────────────────────────────────────────
import UtilizationChart from './components/UtilizationChart'
import MaintenanceChart from './components/MaintenanceChart'
import DepartmentChart  from './components/DepartmentChart'
import BookingHeatmap   from './components/BookingHeatmap'

// ── Tab config ─────────────────────────────────────────────────
const TAB_UTILIZATION  = 'utilization'
const TAB_MAINTENANCE  = 'maintenance'
const TAB_DEPARTMENT   = 'department'
const TAB_HEATMAP      = 'heatmap'

// ── Export dropdown ────────────────────────────────────────────
function ExportMenu({ exportCSV, exportingType }) {
  const EXPORTS = [
    { type: 'utilization',  label: 'Utilization Report' },
    { type: 'maintenance',  label: 'Maintenance Report' },
    { type: 'department',   label: 'Department Summary' },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted"
          disabled={exportingType !== null}
          id="reports-export-btn"
        >
          {exportingType
            ? <RefreshCw size={14} className="animate-spin" />
            : <Download size={14} />
          }
          Export CSV
          <ChevronDown size={12} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Download as CSV</p>
        </div>
        <DropdownMenuSeparator />
        {EXPORTS.map(({ type, label }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => exportCSV(type)}
            disabled={exportingType === type}
            id={`export-${type}-btn`}
            className="gap-2 text-sm"
          >
            <Download size={13} className="text-muted-foreground" />
            {label}
            {exportingType === type && (
              <RefreshCw size={11} className="animate-spin ml-auto text-muted-foreground" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Main page ──────────────────────────────────────────────────
export default function ReportsPage() {
  const { isAdmin, isAssetManager, isDepartmentHead } = useAuth()
  const canSeeAll = isAdmin || isAssetManager

  const [activeTab, setActiveTab] = useState(TAB_UTILIZATION)
  const { exportCSV, exportingType } = useExportReport()

  // ── Data hooks ───────────────────────────────────────────────
  const utilization  = useUtilizationReport()
  const maintenance  = useMaintenanceReport()
  const department   = useDepartmentSummary()
  const heatmap      = useBookingHeatmap()

  // ── Tab definitions ─────────────────────────────────────────
  const tabs = [
    {
      value:   TAB_UTILIZATION,
      label: (
        <span className="flex items-center gap-2">
          <TrendingUp size={14} />
          Utilization
        </span>
      ),
      content: (
        <UtilizationChart
          data={utilization.data}
          isLoading={utilization.isLoading}
          error={utilization.error}
        />
      ),
    },
    // Maintenance tab — only for ADMIN / ASSET_MANAGER
    ...(canSeeAll ? [{
      value:   TAB_MAINTENANCE,
      label: (
        <span className="flex items-center gap-2">
          <Wrench size={14} />
          Maintenance
        </span>
      ),
      content: (
        <MaintenanceChart
          data={maintenance.data}
          isLoading={maintenance.isLoading}
          error={maintenance.error}
        />
      ),
    }] : []),
    {
      value:   TAB_DEPARTMENT,
      label: (
        <span className="flex items-center gap-2">
          <Building2 size={14} />
          Department
        </span>
      ),
      content: (
        <DepartmentChart
          data={department.data}
          isLoading={department.isLoading}
          error={department.error}
        />
      ),
    },
    // Heatmap tab — only for ADMIN / ASSET_MANAGER
    ...(canSeeAll ? [{
      value:   TAB_HEATMAP,
      label: (
        <span className="flex items-center gap-2">
          <CalendarDays size={14} />
          Booking Heatmap
        </span>
      ),
      content: (
        <BookingHeatmap
          data={heatmap.data}
          isLoading={heatmap.isLoading}
          error={heatmap.error}
        />
      ),
    }] : []),
  ]

  // ── Active query for refresh button ─────────────────────────
  const activeQuery = {
    [TAB_UTILIZATION]: utilization,
    [TAB_MAINTENANCE]: maintenance,
    [TAB_DEPARTMENT]:  department,
    [TAB_HEATMAP]:     heatmap,
  }[activeTab]

  return (
    <PageWrapper>
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-50)] dark:bg-blue-950/40 flex items-center justify-center">
              <BarChart3 size={16} className="text-[var(--text-accent)]" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Reports &amp; Analytics
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {canSeeAll
              ? 'Asset utilization, maintenance forecasts, department distribution, and booking patterns.'
              : 'Asset utilization and department distribution across your organization.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Refresh active tab */}
          <Button
            variant="ghost"
            size="icon"
            id="reports-refresh-btn"
            onClick={() => activeQuery?.refetch()}
            disabled={activeQuery?.isFetching}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Refresh data"
          >
            <RefreshCw size={14} className={activeQuery?.isFetching ? 'animate-spin' : ''} />
          </Button>

          {/* CSV Export */}
          <ExportMenu exportCSV={exportCSV} exportingType={exportingType} />
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <ReusableTabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
      />
    </PageWrapper>
  )
}
