import { motion } from 'motion/react'

export default function AuthLayout({ children }) {
  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const fadeInLeft = {
    hidden: { opacity: 0, x: -30 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left Branding Panel ─────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        className="flex-1 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#060918 0%,#0c1445 35%,#0e2060 65%,#081535 100%)' }}
      >
        {/* Glow blobs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(59,130,246,.18) 0%,transparent 65%)' }} 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          className="absolute bottom-24 -left-10 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 65%)' }} 
        />
        
        {/* Dot grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 1.5 }}
          aria-hidden 
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} 
        />

        <div className="flex-1 flex flex-col justify-center">
          <motion.div 
            variants={staggerContainer}
            className="max-w-[440px] mx-auto w-full"
          >
            {/* Top: Logo + Tagline */}
            <div className="relative z-10 mb-12">
              {/* Logo */}
              <motion.div variants={fadeInLeft} className="flex items-center gap-2.5 mb-10">
                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0 bg-accent-500/20 border border-accent-500/35">
                  <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="1" width="4" height="4" rx=".75" fill="white" opacity=".95"/>
                    <rect x="7" y="1" width="4" height="4" rx=".75" fill="white" opacity=".65"/>
                    <rect x="1" y="7" width="4" height="4" rx=".75" fill="white" opacity=".65"/>
                    <rect x="7" y="7" width="4" height="4" rx=".75" fill="white" opacity=".3"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white text-[15px] font-semibold tracking-[-0.01em]">AssetFlow</div>
                  <div className="text-white/30 text-[9.5px] tracking-[0.1em] uppercase mt-px">Asset Management</div>
                </div>
              </motion.div>

              {/* Copy */}
              <motion.p variants={fadeInUp} className="text-white/38 text-[12.5px] mb-2.5 tracking-[0.01em]">Built for modern enterprises</motion.p>
              <motion.h2 variants={fadeInUp} className="text-white text-[38px] font-bold leading-[1.15] tracking-[-0.025em] mb-5">
                Manage your assets<br />
                <span className="text-blue-400">with precision.</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-white/42 text-[15px] leading-[1.65] max-w-[360px]">
                Track, allocate, and manage your organization's assets across
                departments and locations. Fast, secure, and easy to use.
              </motion.p>
            </div>

            {/* Feature pills */}
            <div className="relative z-10">
              <motion.div variants={staggerContainer} className="flex flex-wrap gap-3">
                {[
                  'Asset lifecycle tracking',
                  'Role-based access control',
                  'Maintenance & audit',
                ].map((f) => (
                  <motion.div key={f} variants={fadeInUp} className="flex items-center gap-2.5 px-3.5 py-2 rounded-[7px] bg-white/[.035] border border-white/[.06]">
                    <div className="w-[5px] h-[5px] rounded-full bg-blue-500 shrink-0" />
                    <span className="text-white/48 text-[12.5px]">{f}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom: copyright */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative z-10 w-full max-w-[440px] mx-auto pb-4"
        >
          <div className="flex justify-between items-center border-t border-white/[.07] pt-5">
            <span className="text-white/18 text-[10.5px] uppercase tracking-[0.05em]">AssetFlow v1.0</span>
            <span className="text-white/18 text-[10.5px]">© 2026</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Form Panel ────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
        className="w-full lg:w-[620px] shrink-0 flex items-center justify-center bg-white px-8 py-12 relative"
      >
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-[6px] flex items-center justify-center bg-accent-500">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="1" width="4" height="4" rx=".75" fill="white" opacity=".95"/>
              <rect x="7" y="1" width="4" height="4" rx=".75" fill="white" opacity=".65"/>
              <rect x="1" y="7" width="4" height="4" rx=".75" fill="white" opacity=".65"/>
              <rect x="7" y="7" width="4" height="4" rx=".75" fill="white" opacity=".3"/>
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-text-primary tracking-[-0.01em]">AssetFlow</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.2 }}
          className="w-full max-w-[400px]"
        >
          {children}
        </motion.div>
      </motion.div>

    </div>
  )
}
