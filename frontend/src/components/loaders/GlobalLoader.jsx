// components/loaders/GlobalLoader.jsx
// Full-screen init loader — clean, neutral, no heavy color.

import { cn } from '@/lib/utils'

export default function GlobalLoader({ message = 'Loading...' }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5"
      style={{ background: 'var(--bg-app)' }}
      role="status"
      aria-live="polite"
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-[5px] flex items-center justify-center"
          style={{ background: '#2563eb' }}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.95"/>
            <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
            <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
            <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span
          className="text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: 'var(--text-primary)' }}
        >
          AssetFlow
        </span>
      </div>

      {/* Spinner — thin, neutral */}
      <div
        className="w-5 h-5 rounded-full border-[1.5px] animate-spin"
        style={{
          borderColor: 'var(--border-default)',
          borderTopColor: 'var(--color-accent-500)',
        }}
      />

      <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        {message}
      </p>
    </div>
  )
}
