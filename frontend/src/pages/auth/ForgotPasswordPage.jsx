// pages/auth/ForgotPasswordPage.jsx
// Forgot password — sends reset link to email.

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { forgotPasswordSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data) => {
    try {
      // TODO: Replace with real API call via authService.forgotPassword(data)
      await new Promise((r) => setTimeout(r, 700))
      setSent(true)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.')
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Check your email
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We sent a reset link to{' '}
            <strong className="text-slate-700 dark:text-slate-300">
              {getValues('email')}
            </strong>
          </p>
        </div>
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Forgot password?
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="forgot-email"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Work email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              {...register('email')}
              className={cn(
                'w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border transition-colors',
                'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
                'placeholder:text-slate-400',
                errors.email
                  ? 'border-red-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-400',
                'focus:outline-none focus:ring-2 focus:ring-indigo-400/20',
              )}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'px-4 py-2.5 rounded-lg text-sm font-semibold',
            'bg-indigo-600 text-white hover:bg-indigo-700',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'transition-colors duration-150',
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <Link
        to={ROUTES.LOGIN}
        className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  )
}
