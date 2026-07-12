// pages/reports/components/BookingHeatmap.jsx
// GitHub-style 7×24 booking frequency heatmap.
// API: { heatmap: [[...24 hours], ...7 days] }
// Row index 0 = Sunday, column index 0 = Midnight (00:00)


import ReportSkeleton from './ReportSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, AlertCircle } from 'lucide-react'

const DAY_LABELS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOUR_LABELS  = Array.from({ length: 24 }, (_, i) => {
  if (i === 0)  return '12a'
  if (i === 12) return '12p'
  if (i < 12)   return `${i}a`
  return `${i - 12}p`
})

// ── Intensity → color class ────────────────────────────────────
function getIntensityClass(value, max) {
  if (max === 0 || value === 0) return 'bg-muted'
  const pct = value / max
  if (pct < 0.15) return 'bg-blue-100 dark:bg-blue-950/30'
  if (pct < 0.30) return 'bg-blue-200 dark:bg-blue-900/50'
  if (pct < 0.50) return 'bg-blue-300 dark:bg-blue-800/60'
  if (pct < 0.70) return 'bg-blue-400 dark:bg-blue-700/70'
  if (pct < 0.85) return 'bg-blue-500 dark:bg-blue-600/80'
  return 'bg-[var(--accent-600)] dark:bg-blue-500'
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
      <CalendarDays size={28} className="opacity-40" />
      <p className="text-sm">No booking data available for the past 30 days.</p>
    </div>
  )
}

export default function BookingHeatmap({ data, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <ReportSkeleton variant="kpi" />
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-52 mb-1" />
          <Skeleton className="h-3 w-80 mb-6" />
          <ReportSkeleton variant="heatmap" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-44 mb-1" />
          <Skeleton className="h-3 w-64 mb-4" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertCircle size={22} className="text-danger-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Failed to load booking heatmap</p>
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

  // heatmap is a 7×24 matrix
  const matrix = data?.heatmap

  // Validate shape
  const isValid = Array.isArray(matrix) && matrix.length === 7 && matrix[0]?.length === 24
  if (!isValid) return <EmptyState />

  // Find global max for colour scaling
  const max = Math.max(...matrix.flat())
  const totalBookings = matrix.flat().reduce((s, v) => s + v, 0)

  // Find busiest slot
  let busiestDay = 0, busiestHour = 0
  matrix.forEach((row, d) => row.forEach((val, h) => {
    if (val > matrix[busiestDay][busiestHour]) { busiestDay = d; busiestHour = h }
  }))

  // Peak hours: sum per hour across all days
  const hourlyTotals = Array.from({ length: 24 }, (_, h) => matrix.reduce((s, d) => s + d[h], 0))
  const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals))

  return (
    <div className="space-y-8">
      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Bookings (30d)</p>
          <p className="text-3xl font-bold text-foreground">{totalBookings}</p>
          <p className="text-xs text-muted-foreground mt-1">across all time slots</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Busiest Day</p>
          <p className="text-2xl font-bold text-foreground">{DAY_LABELS[busiestDay]}</p>
          <p className="text-xs text-muted-foreground mt-1">
            at {HOUR_LABELS[busiestHour]} with {matrix[busiestDay][busiestHour]} bookings
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Peak Hour</p>
          <p className="text-2xl font-bold text-[var(--text-accent)]">
            {HOUR_LABELS[peakHour]}
          </p>
          <p className="text-xs text-muted-foreground mt-1">highest booking frequency</p>
        </div>
      </div>

      {/* ── Heatmap Grid ───────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground">Booking Activity Heatmap</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Booking frequency by day of week and hour of day (past 30 days). Darker = more bookings.
        </p>

        {totalBookings === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex gap-0.5 mb-1 pl-10">
                {HOUR_LABELS.map((label, h) => (
                  <div
                    key={h}
                    className="flex-1 text-center text-[9px] text-muted-foreground"
                    style={{ minWidth: 18 }}
                  >
                    {h % 3 === 0 ? label : ''}
                  </div>
                ))}
              </div>

              {/* Day rows */}
              {matrix.map((row, d) => (
                <div key={d} className="flex items-center gap-0.5 mb-0.5">
                  {/* Day label */}
                  <div className="w-9 flex-shrink-0 text-[10px] font-medium text-muted-foreground text-right pr-2">
                    {DAY_LABELS[d]}
                  </div>
                  {/* Hour cells */}
                  {row.map((val, h) => (
                    <div
                      key={h}
                      className={`flex-1 h-7 rounded-sm cursor-default transition-all hover:ring-2 hover:ring-[var(--border-accent)] hover:ring-offset-1 ${getIntensityClass(val, max)}`}
                      style={{ minWidth: 18 }}
                      onMouseEnter={e => {
                        setTooltip({ day: d, hour: h, value: val })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      title={`${DAY_LABELS[d]} ${HOUR_LABELS[h]}: ${val} booking${val !== 1 ? 's' : ''}`}
                    />
                  ))}
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[10px] text-muted-foreground">Less</span>
                {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((pct, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${getIntensityClass(pct * max, max)}`}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Hourly Activity Bar ────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Hourly Activity Summary</h3>
        <p className="text-xs text-muted-foreground mb-4">Total bookings per hour across all days</p>
        <div className="flex items-end gap-0.5 h-20">
          {hourlyTotals.map((val, h) => {
            const maxHourly = Math.max(...hourlyTotals)
            const heightPct = maxHourly > 0 ? (val / maxHourly) * 100 : 0
            const isPeak = h === peakHour
            return (
              <div
                key={h}
                className="flex-1 group relative flex flex-col justify-end"
                title={`${HOUR_LABELS[h]}: ${val} bookings`}
              >
                <div
                  className={`rounded-t-sm transition-all ${isPeak ? 'bg-[var(--accent-500)]' : 'bg-blue-200 dark:bg-blue-900/50'} group-hover:bg-[var(--accent-500)]`}
                  style={{ height: `${Math.max(heightPct, val > 0 ? 4 : 0)}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex mt-1">
          {HOUR_LABELS.map((label, h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
              {h % 4 === 0 ? label : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
