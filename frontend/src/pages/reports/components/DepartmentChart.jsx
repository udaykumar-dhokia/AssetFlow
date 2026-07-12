// pages/reports/components/DepartmentChart.jsx
// Department-wise asset distribution: PieChart + detailed data grid.

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Building2, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ReportSkeleton from './ReportSkeleton'

// ── Palette (sufficient for up to 12 departments) ─────────────
const DEPT_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#d97706',
  '#dc2626', '#0891b2', '#be185d', '#16a34a',
  '#9333ea', '#ea580c', '#0284c7', '#4f46e5',
]

// ── Custom tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-overlay text-sm">
      <p className="font-semibold text-foreground mb-1">{item.name}</p>
      <p>
        <span className="font-bold text-lg" style={{ color: item.payload.fill }}>
          {item.value}
        </span>
        <span className="text-muted-foreground ml-1">active assets</span>
      </p>
    </div>
  )
}

// ── Render custom legend ───────────────────────────────────────
const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: entry.color }}
        />
        {entry.value}
      </div>
    ))}
  </div>
)

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <Building2 size={28} className="opacity-40" />
      <p className="text-sm">No department data available.</p>
    </div>
  )
}

export default function DepartmentChart({ data, isLoading, error, onRetry }) {
  if (isLoading) return (
    <div className="space-y-8">
      <ReportSkeleton variant="kpi" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-36 mb-1" />
          <Skeleton className="h-3 w-48 mb-4" />
          <div className="flex items-center justify-center h-64">
            <Skeleton className="w-44 h-44 rounded-full" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-44 mb-1" />
          <Skeleton className="h-3 w-36 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2.5 h-2.5 rounded-full" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle size={22} className="text-danger-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Failed to load department summary</p>
          <p className="text-xs text-muted-foreground mt-1">{error?.message ?? 'An unexpected error occurred.'}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="text-xs text-[var(--text-accent)] hover:underline mt-1">
            Try again
          </button>
        )}
      </div>
    )
  }

  const departments = Array.isArray(data) ? data : []
  const totalAssets = departments.reduce((s, d) => s + (d.totalActiveAssets ?? 0), 0)

  const pieData = departments.map((dept, i) => ({
    name:  dept.departmentName,
    value: dept.totalActiveAssets,
    fill:  DEPT_COLORS[i % DEPT_COLORS.length],
  }))

  return (
    <div className="space-y-8">
      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Active Assets</p>
          <p className="text-3xl font-bold text-foreground">{totalAssets}</p>
          <p className="text-xs text-muted-foreground mt-1">across the organisation</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Departments</p>
          <p className="text-3xl font-bold text-foreground">{departments.length}</p>
          <p className="text-xs text-muted-foreground mt-1">with allocated assets</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Largest Department</p>
          <p className="text-lg font-bold text-foreground truncate">
            {[...departments].sort((a, b) => b.totalActiveAssets - a.totalActiveAssets)[0]?.departmentName ?? '—'}
          </p>
          <p className="text-xs text-[var(--text-accent)] mt-1 font-medium">
            {[...departments].sort((a, b) => b.totalActiveAssets - a.totalActiveAssets)[0]?.totalActiveAssets ?? 0} assets
          </p>
        </div>
      </div>

      {/* ── Pie Chart + Data Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Asset Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Active assets per department</p>
          {departments.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Data Grid */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Breakdown by Department</h3>
          <p className="text-xs text-muted-foreground mb-4">Category-level asset counts</p>
          {departments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-1 overflow-y-auto max-h-72 pr-1">
              {[...departments]
                .sort((a, b) => b.totalActiveAssets - a.totalActiveAssets)
                .map((dept, i) => {
                  const pct = totalAssets > 0 ? Math.round((dept.totalActiveAssets / totalAssets) * 100) : 0
                  const color = DEPT_COLORS[i % DEPT_COLORS.length]
                  const categories = Object.entries(dept.breakdownByCategory ?? {})
                  return (
                    <div key={dept.departmentId} className="rounded-lg border border-border p-3 mb-2">
                      {/* Row header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: color }}
                        />
                        <p className="text-sm font-semibold text-foreground flex-1 truncate">
                          {dept.departmentName}
                        </p>
                        <span className="text-xs font-bold text-foreground">{dept.totalActiveAssets}</span>
                        <span className="text-xs text-muted-foreground w-9 text-right">{pct}%</span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      {/* Category breakdown chips */}
                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {categories.map(([cat, count]) => (
                            <span
                              key={cat}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {cat}: {count}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
