// pages/reports/components/ReportSkeleton.jsx
// Skeleton placeholder shown while report data is loading.
// Fixed: no Math.random() — deterministic heights to avoid layout shifts.

import { Skeleton } from '@/components/ui/skeleton'

// Fixed bar heights so the skeleton is stable across renders
const CHART_HEIGHTS = [65, 90, 45, 80, 55, 75, 35, 95, 60, 70]

export default function ReportSkeleton({ variant = 'chart' }) {
  // ── KPI cards strip ───────────────────────────────────────────
  if (variant === 'kpi') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`bg-card border border-border rounded-xl p-4 space-y-3 ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-14" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
    )
  }

  // ── Table / list rows ─────────────────────────────────────────
  if (variant === 'table') {
    return (
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            <Skeleton className="h-4 w-5 flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  // ── Heatmap grid ──────────────────────────────────────────────
  if (variant === 'heatmap') {
    return (
      <div className="space-y-1.5">
        {/* Hour label row */}
        <div className="flex gap-0.5 pl-10 mb-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" style={{ minWidth: 18 }} />
          ))}
        </div>
        {/* Day rows */}
        {Array.from({ length: 7 }).map((_, d) => (
          <div key={d} className="flex items-center gap-0.5">
            <Skeleton className="h-7 w-9 flex-shrink-0 rounded" />
            {Array.from({ length: 24 }).map((_, h) => (
              <Skeleton key={h} className="h-7 flex-1 rounded-sm" style={{ minWidth: 18 }} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  // ── Bar chart (default) ───────────────────────────────────────
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-52 px-4">
        {CHART_HEIGHTS.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex gap-4 justify-center pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
    </div>
  )
}
