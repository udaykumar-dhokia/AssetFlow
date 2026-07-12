// layouts/AuthLayout.jsx
// Auth layout — clean, professional, white-first.
// Design reference: Stripe, Linear, Vercel login pages.
// Rules:
//   - Left panel: very dark neutral (not indigo), minimal branding
//   - Right: pure white card on light gray bg
//   - No gradients on the card itself
//   - Borders over shadows

import { cn } from '@/lib/utils'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-app)' }}>
      {/* ── Left branding panel ──────────────────────────────── */}
      <div
        className={cn(
          'hidden lg:flex flex-col justify-between',
          'w-[380px] flex-shrink-0 p-10',
          'relative overflow-hidden',
        )}
        style={{ background: '#111113', borderRight: '1px solid #1e1e21' }}
      >
        {/* Subtle dot grid — very low opacity */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div
              className="w-7 h-7 rounded-[5px] flex items-center justify-center flex-shrink-0"
              style={{ background: '#2563eb' }}
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.95"/>
                <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
                <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
                <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <span className="text-white text-[15px] font-semibold tracking-[-0.01em]">
              AssetFlow
            </span>
          </div>

          <div className="space-y-3">
            <h2
              className="text-white text-[22px] font-semibold tracking-[-0.02em] leading-[1.25]"
            >
              Enterprise Asset
              <br />
              Management
            </h2>
            <p className="text-[13px] leading-relaxed" style={{ color: '#6b6b72' }}>
              Track, allocate, and manage your organization&apos;s assets
              with precision across departments and locations.
            </p>
          </div>
        </div>

        {/* Features — clean text list, no icons */}
        <div className="relative z-10 space-y-3">
          {[
            'Asset lifecycle tracking',
            'Role-based access control',
            'Maintenance & audit workflows',
            'Real-time notifications',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: '#2563eb' }}
              />
              <span className="text-[12.5px]" style={{ color: '#6b6b72' }}>
                {f}
              </span>
            </div>
          ))}

          <p
            className="text-[11px] mt-6 pt-4 border-t"
            style={{ color: '#3a3a3e', borderColor: '#1e1e21' }}
          >
            AssetFlow by your team · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right: form area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div
            className="w-6 h-6 rounded-[4px] flex items-center justify-center"
            style={{ background: '#2563eb' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.95"/>
              <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
              <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
              <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <span
            className="font-semibold text-[14px] tracking-[-0.01em]"
            style={{ color: 'var(--text-primary)' }}
          >
            AssetFlow
          </span>
        </div>

        {/* Card — white, hairline border, minimal shadow */}
        <div
          className="w-full max-w-[380px] p-8 rounded-[8px]"
          style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
