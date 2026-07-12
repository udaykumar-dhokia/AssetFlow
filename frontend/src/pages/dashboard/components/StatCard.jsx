import { motion } from 'motion/react'

export default function StatCard({ title, value, icon: Icon, color, delay = 0 }) {
  // Pre-defined color mapping for the glowing icon effect and borders
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20 ring-blue-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 ring-indigo-500/20',
    green: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 ring-emerald-500/20',
    yellow: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 ring-amber-500/20',
    red: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20 ring-rose-500/20',
    purple: 'text-purple-500 bg-purple-500/10 dark:bg-purple-500/20 ring-purple-500/20',
    orange: 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/20 ring-orange-500/20',
  }

  const selectedColor = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm ring-1 ring-inset ring-slate-200/20 hover:shadow-md transition-all duration-300"
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${selectedColor.split(' ')[0].replace('text-', 'bg-')}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {value !== undefined ? value : '--'}
            </h3>
          </div>
        </div>
        <div className={`p-3 rounded-xl ring-1 ring-inset ${selectedColor}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  )
}
