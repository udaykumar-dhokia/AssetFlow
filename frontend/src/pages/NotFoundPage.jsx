// pages/NotFoundPage.jsx
// 404 page — shown for unknown routes.

import { useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center',
        'bg-slate-50 dark:bg-slate-950',
        'gap-6 px-6 text-center',
      )}
    >
      {/* Illustration */}
      <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
        <FileQuestion size={40} className="text-indigo-400 dark:text-indigo-500" />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h1 className="text-5xl font-black text-slate-200 dark:text-slate-800">
          404
        </h1>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Page not found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg',
          'bg-indigo-600 text-white text-sm font-semibold',
          'hover:bg-indigo-700 transition-colors',
        )}
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>
    </div>
  )
}
