// pages/reports/components/MaintenanceChart.jsx
// Maintenance frequency bar chart + due-for-maintenance + nearing-retirement lists.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { AlertCircle, Clock, Wrench, ShieldAlert } from 'lucide-react'
import { format, differenceInYears } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import ReportSkeleton from './ReportSkeleton'

// ── Custom tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-overlay text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p>
        <span className="font-bold text-lg text-orange-500">{payload[0].value}</span>
        <span className="text-muted-foreground ml-1">requests</span>
      </p>
    </div>
  )
}

const CATEGORY_COLORS = [
  '#f97316', '#fb923c', '#fdba74', '#fed7aa',
  '#ef4444', '#f87171', '#fca5a5', '#fecaca',
]

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Wrench size={18} className="opacity-40" />
      </div>
      <p className="text-sm text-center">{message}</p>
    </div>
  )
}

export default function MaintenanceChart({ data, isLoading, error, onRetry }) {
  if (isLoading) return (
    <div className="space-y-8">
      <ReportSkeleton variant="kpi" />
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-4 w-56 mb-1" />
        <Skeleton className="h-3 w-80 mb-6" />
        <ReportSkeleton variant="chart" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <Skeleton className="h-4 w-44 mb-4" />
          <ReportSkeleton variant="table" />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <Skeleton className="h-4 w-36 mb-4" />
          <ReportSkeleton variant="table" />
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
          <p className="text-sm font-medium text-foreground">Failed to load maintenance analytics</p>
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

  const frequencyByCategory = data?.frequencyByCategory ?? {}
  const dueForMaintenance   = data?.dueForMaintenance   ?? []
  const nearingRetirement   = data?.nearingRetirement   ?? []

  // Build chart data from category frequency
  const chartData = Object.entries(frequencyByCategory).map(([name, count]) => ({ name, count }))
  const totalRequests = chartData.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-8">
      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Repair Requests</p>
          <p className="text-3xl font-bold text-foreground">{totalRequests}</p>
          <p className="text-xs text-muted-foreground mt-1">across all categories</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Due for Deep Maintenance</p>
          <p className="text-3xl font-bold text-orange-500">{dueForMaintenance.length}</p>
          <p className="text-xs text-muted-foreground mt-1">≥ 3 repair requests</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Nearing Retirement</p>
          <p className="text-3xl font-bold text-danger-600">{nearingRetirement.length}</p>
          <p className="text-xs text-muted-foreground mt-1">older than 3 years</p>
        </div>
      </div>

      {/* ── Frequency Bar Chart ────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Repair Frequency by Category</h3>
        <p className="text-xs text-muted-foreground mb-6">Total maintenance requests raised per asset category</p>
        {chartData.length === 0 ? (
          <EmptyState message="No maintenance data available." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)', radius: 4 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Due for Maintenance + Nearing Retirement ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due for Deep Maintenance */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={16} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">Due for Deep Maintenance</h3>
            <span className="ml-auto text-xs text-muted-foreground">{dueForMaintenance.length}</span>
          </div>
          {dueForMaintenance.length === 0
            ? <EmptyState message="No assets have exceeded the repair threshold." />
            : dueForMaintenance.map(asset => (
                <div key={asset.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.tag}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 flex-shrink-0">
                    {asset.requestCount} requests
                  </span>
                </div>
              ))
          }
        </div>

        {/* Nearing Retirement */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-danger-600" />
            <h3 className="text-sm font-semibold text-foreground">Nearing Retirement</h3>
            <span className="ml-auto text-xs text-muted-foreground">{nearingRetirement.length}</span>
          </div>
          {nearingRetirement.length === 0
            ? <EmptyState message="No assets are flagged for retirement yet." />
            : nearingRetirement.map(asset => {
                const years = differenceInYears(new Date(), new Date(asset.acquisitionDate))
                return (
                  <div key={asset.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{asset.tag}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-danger-600">{years}y old</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(asset.acquisitionDate), 'MMM yyyy')}
                      </p>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
