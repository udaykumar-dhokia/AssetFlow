// layouts/AuthLayout.jsx
// Design inspired by ConnectVision — deep-navy gradient left panel, clean white right.

export default function AuthLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    }}>

      {/* ── Left Branding Panel ───────────────────────────────── */}
      <div style={{
        width: '460px',
        flexShrink: 0,
        background: 'linear-gradient(150deg, #060918 0%, #0c1445 35%, #0e2060 65%, #081535 100%)',
        padding: '48px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        // hide on small screens via inline media query trick — handled by JS check
      }}>

        {/* Decorative glow blobs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '100px', left: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Dot grid overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        {/* Top: Logo + Tagline */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '52px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '9px',
              background: 'rgba(59,130,246,0.18)',
              border: '1px solid rgba(59,130,246,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.95"/>
                <rect x="7" y="1" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
                <rect x="1" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.65"/>
                <rect x="7" y="7" width="4" height="4" rx="0.75" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em' }}>
                AssetFlow
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.3)', fontSize: '9.5px',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '1px',
              }}>
                Asset Management
              </div>
            </div>
          </div>

          {/* Main copy */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12.5px', marginBottom: '10px', letterSpacing: '0.01em' }}>
              Built for modern enterprises
            </p>
            <h2 style={{
              color: '#ffffff',
              fontSize: '30px',
              fontWeight: 700,
              lineHeight: 1.22,
              letterSpacing: '-0.025em',
              marginBottom: '20px',
            }}>
              Manage your assets<br />
              <span style={{ color: '#60a5fa' }}>with precision.</span>
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.42)',
              fontSize: '13.5px',
              lineHeight: 1.75,
              maxWidth: '340px',
            }}>
              Track, allocate, and manage your organization's assets across
              departments and locations. Fast, secure, and easy to use.
            </p>
          </div>
        </div>

        {/* Bottom: Features + Copyright */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '28px' }}>
            {[
              { icon: '⬡', label: 'Asset lifecycle tracking' },
              { icon: '⬡', label: 'Role-based access control' },
              { icon: '⬡', label: 'Maintenance & audit workflows' },
              { icon: '⬡', label: 'Real-time notifications' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 14px',
                borderRadius: '7px',
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#3b82f6', flexShrink: 0,
                }} />
                <span style={{ color: 'rgba(255,255,255,0.48)', fontSize: '12.5px' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10.5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              AssetFlow v1.0
            </span>
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10.5px' }}>
              © 2026
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        padding: '48px 32px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
