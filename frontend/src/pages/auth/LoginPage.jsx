// pages/auth/LoginPage.jsx
// Design: Stripe-style clean form — neutral inputs, single accent CTA.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { loginSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { loginSuccess, setAuthLoading } from '@/redux/slices/authSlice'
import { cn } from '@/lib/utils'

// ── Shared input className ────────────────────────────────────
const inputBase = cn(
  'w-full h-8 px-3 text-[13px] rounded-[5px]',
  'border transition-colors duration-100',
  'bg-[var(--bg-canvas)] text-[var(--text-primary)]',
  'placeholder:text-[var(--text-disabled)]',
  'focus:outline-none focus:border-[var(--border-accent)]',
  'focus:ring-2 focus:ring-[var(--ring-accent)]',
)

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPw, setShowPw] = useState(false)

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    try {
      dispatch(setAuthLoading(true))
      // TODO: replace with authService.login(data)
      await new Promise((r) => setTimeout(r, 700))
      dispatch(loginSuccess({
        token: 'mock-token',
        user: { id: '1', name: 'Demo User', email: data.email, role: 'admin' },
      }))
      toast.success('Signed in successfully')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Invalid credentials')
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1
          className="text-[18px] font-semibold tracking-[-0.02em]"
          style={{ color: 'var(--text-primary)' }}
        >
          Sign in
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Enter your work credentials to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-[12.5px] font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            {...register('email')}
            className={cn(
              inputBase,
              errors.email
                ? 'border-[var(--border-danger)] focus:ring-[var(--ring-danger)]'
                : 'border-[var(--border-default)]',
            )}
          />
          {errors.email && (
            <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-[12.5px] font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-[12px]"
              style={{ color: 'var(--text-link)' }}
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={cn(
                inputBase,
                'pr-9',
                errors.password
                  ? 'border-[var(--border-danger)] focus:ring-[var(--ring-danger)]'
                  : 'border-[var(--border-default)]',
              )}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-disabled)' }}
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full h-8 flex items-center justify-center gap-1.5',
            'rounded-[5px] text-[13px] font-medium text-white',
            'transition-opacity duration-100',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
          style={{ background: '#1d4ed8' }}
        >
          {isSubmitting && <Loader2 size={13} className="animate-spin" />}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium"
          style={{ color: 'var(--text-link)' }}
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
