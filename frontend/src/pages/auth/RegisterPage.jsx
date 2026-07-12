// pages/auth/RegisterPage.jsx
// Design: same clean language as LoginPage.

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { registerSchema } from '@/utils/validators'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const inputBase = cn(
  'w-full h-8 px-3 text-[13px] rounded-[5px]',
  'border transition-colors duration-100',
  'bg-[var(--bg-canvas)] text-[var(--text-primary)]',
  'placeholder:text-[var(--text-disabled)]',
  'focus:outline-none focus:border-[var(--border-accent)]',
  'focus:ring-2 focus:ring-[var(--ring-accent)]',
)

const labelClass = 'block text-[12.5px] font-medium'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async () => {
    try {
      await new Promise((r) => setTimeout(r, 700))
      toast.success('Account created. Please sign in.')
      navigate(ROUTES.LOGIN)
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  const fieldError = (key) =>
    errors[key] ? 'border-[var(--border-danger)] focus:ring-[var(--ring-danger)]' : 'border-[var(--border-default)]'

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[18px] font-semibold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
          Create account
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          Employee account — admin roles assigned later
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className={labelClass} style={{ color: 'var(--text-secondary)' }}>Full name</label>
          <input id="reg-name" type="text" autoComplete="name" placeholder="Priya Shah"
            {...register('name')}
            className={cn(inputBase, fieldError('name'))}
          />
          {errors.name && <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className={labelClass} style={{ color: 'var(--text-secondary)' }}>Work email</label>
          <input id="reg-email" type="email" autoComplete="email" placeholder="name@company.com"
            {...register('email')}
            className={cn(inputBase, fieldError('email'))}
          />
          {errors.email && <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className={labelClass} style={{ color: 'var(--text-secondary)' }}>Password</label>
          <div className="relative">
            <input id="reg-password" type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="Min. 8 characters"
              {...register('password')}
              className={cn(inputBase, 'pr-9', fieldError('password'))}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPw(p => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-disabled)' }}
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          {errors.password && <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>{errors.password.message}</p>}
        </div>

        {/* Confirm */}
        <div className="space-y-1.5">
          <label htmlFor="reg-confirm" className={labelClass} style={{ color: 'var(--text-secondary)' }}>Confirm password</label>
          <input id="reg-confirm" type="password" autoComplete="new-password" placeholder="Re-enter password"
            {...register('confirmPassword')}
            className={cn(inputBase, fieldError('confirmPassword'))}
          />
          {errors.confirmPassword && <p className="text-[11.5px]" style={{ color: 'var(--color-danger-600)' }}>{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-8 flex items-center justify-center gap-1.5 rounded-[5px] text-[13px] font-medium text-white transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: '#1d4ed8' }}
        >
          {isSubmitting && <Loader2 size={13} className="animate-spin" />}
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-[12.5px]" style={{ color: 'var(--text-tertiary)' }}>
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium" style={{ color: 'var(--text-link)' }}>Sign in</Link>
      </p>
    </div>
  )
}
