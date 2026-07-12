// pages/reports/components/UtilizationChart.jsx
// Asset utilization bar chart + top/idle leaderboards.

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
import { TrendingUp, TrendingDown, Share2, Lock, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ReportSkeleton from './ReportSkeleton'

// ── Custom tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-overlay text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-[var(--text-accent)]">
        <span className="font-bold text-lg">{payload[0].value}</span>
        <span className="text-muted-foreground ml-1">usages</span>
      </p>
    </div>
  )
}

// ── Bar fill by intensity ──────────────────────────────────────
const COLORS = [
  '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  '#bfdbfe', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff',
]

// ── Empty state ────────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
      <TrendingDown size={28} className="opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Asset leaderboard card ─────────────────────────────────────
function AssetCard({ asset, rank, colorClass }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {rank !== undefined && (
        <span className="text-xs font-bold w-5 text-center text-muted-foreground">#{rank + 1}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{asset.name}</p>
        <p className="text-xs text-muted-foreground font-mono">{asset.tag}</p>
      </div>
      <div className="flex items-center gap-2">
        {asset.isShared
          ? <Share2 size={12} className="text-[var(--text-accent)] flex-shrink-0" />
          : <Lock size={12} className="text-muted-foreground flex-shrink-0" />
        }
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
          {asset.totalUsage} uses
        </span>
      </div>
    </div>
  )
}

export default function UtilizationChart({ data, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <ReportSkeleton variant="kpi" />
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-4 w-48 mb-1" />
          <Skeleton className="h-3 w-72 mb-6" />
          <ReportSkeleton variant="chart" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <Skeleton className="h-4 w-32 mb-4" />
            <ReportSkeleton variant="table" />
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <Skeleton className="h-4 w-24 mb-4" />
            <ReportSkeleton variant="table" />
          </div>
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
          <p className="text-sm font-medium text-foreground">Failed to load utilization data</p>
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

  const mostUsed = data?.mostUsed ?? []
  const idle     = data?.idle     ?? []

  // Build chart data from top-used (max 10)
  const chartData = mostUsed.slice(0, 10).map(a => ({
    name:  a.name.length > 16 ? a.name.slice(0, 14) + '…' : a.name,
    usage: a.totalUsage,
  }))

  return (
    <div className="space-y-8">
      {/* ── Summary KPIs ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Most Active Asset</p>
          <p className="text-lg font-bold text-foreground truncate">
            {mostUsed[0]?.name ?? '—'}
          </p>
          <p className="text-xs text-[var(--text-accent)] mt-1 font-medium">
            {mostUsed[0]?.totalUsage ?? 0} usages (90 days)
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Top Assets Tracked</p>
          <p className="text-3xl font-bold text-foreground">{mostUsed.length}</p>
          <p className="text-xs text-muted-foreground mt-1">with recorded usage</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Idle Assets</p>
          <p className="text-3xl font-bold text-warning-600">{idle.length}</p>
          <p className="text-xs text-muted-foreground mt-1">zero usage in 90 days</p>
        </div>
      </div>

      {/* ── Bar Chart ──────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Top 10 Most Used Assets</h3>
        <p className="text-xs text-muted-foreground mb-6">Combined allocation + booking usage over the past 90 days</p>
        {chartData.length === 0 ? (
          <EmptyState message="No usage data available for the past 90 days." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
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
              <Bar dataKey="usage" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Leaderboards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--text-accent)]" />
            <h3 className="text-sm font-semibold text-foreground">Most Used</h3>
            <span className="ml-auto text-xs text-muted-foreground">{mostUsed.length} assets</span>
          </div>
          {mostUsed.length === 0
            ? <EmptyState message="No usage data yet." />
            : mostUsed.slice(0, 8).map((a, i) => (
                <AssetCard
                  key={a.assetId}
                  asset={a}
                  rank={i}
                  colorClass="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                />
              ))
          }
        </div>

        {/* Idle Assets */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-warning-600" />
            <h3 className="text-sm font-semibold text-foreground">Idle Assets</h3>
            <span className="ml-auto text-xs text-muted-foreground">{idle.length} assets</span>
          </div>
          {idle.length === 0
            ? <EmptyState message="All assets have been used recently. Great!" />
            : idle.slice(0, 8).map((a, i) => (
                <AssetCard
                  key={a.assetId}
                  asset={a}
                  rank={undefined}
                  colorClass="bg-warning-50 text-warning-600 dark:bg-yellow-950/40 dark:text-yellow-300"
                />
              ))
          }
        </div>
      </div>
    </div>
  )
}
